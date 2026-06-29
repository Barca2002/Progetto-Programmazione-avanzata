import { DatiinviatiDAO } from '../dao/DatiInviatiDAO.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { ImbarcazioneDAO } from '../dao/ImbarcazioneDAO.js';
import { Datiinviati, DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
import { ImbarcazioneService } from './ImbarcazioneService.js';
import { LogSpostamentiService } from './LogSpostamentiService.js';
import { GeofenceareaService } from './GeofenceareaService.js';

export class DatiInviatiService {
  private readonly datiinviatiDAO = new DatiinviatiDAO();
  private readonly geofenceareaService = new GeofenceareaService();
  private readonly imbarcazioneDAO = new ImbarcazioneDAO();
  private readonly imbarcazioniService = new ImbarcazioneService();
  private readonly logspostamentoService = new LogSpostamentiService();

  //Torna l'ultimo dato inviato per quella imbarcazione
  public async findLastDatoInviatoByMmsi(mmsi: number): Promise<Datiinviati> {
    const dato = await this.datiinviatiDAO.getLastDatoByMmsi(mmsi);
    if (!dato) {
      throw ErrorFactory.getError(AppErrorEnum.DATO_NOT_FOUND);
    }
    return dato;
  }


  public async sendData(data: DatiinviatiCreationData, user_id: number): Promise<void> {

    const imbarcazione = await this.imbarcazioneDAO.get(data.mmsi);
    if (!imbarcazione) {
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    }
    // Passiamo l'user_id estratto dal token JWT per controllare se è il proprietario della barca.
    await this.imbarcazioniService.checkOwnershipImbarcazione(user_id, data.mmsi);
    const geofence_imbarcazioni = DatabaseConnection.getInstance().model('geofence_imbarcazioni');
    const allowedGeoareas = await geofence_imbarcazioni.findAll({ where: { mmsi: data.mmsi } }) as unknown as { geoarea_id: number }[];
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      const current_geoarea = await this.geofenceareaService.getGeoareaByPosition(data.longitudine, data.latitudine);
      //Controllo se ha trovato una geoarea in cui risiede il punto
      if (!current_geoarea) {
        throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
      }
      const currentAreaIsAllowed: boolean = allowedGeoareas.some(g => g.geoarea_id === current_geoarea.geoarea_id);
      // Prendiamo l'ultimo spostamento/dato inviato per determinare la posizione precedente.
      const lastSpostamento = await this.findLastDatoInviatoByMmsi(data.mmsi);
      // Se non viene trova uno spostamento precedente, vuol dire che è il primo invio di dati.
      if (!lastSpostamento) {
        if (currentAreaIsAllowed) {
          // Primo invio dei dati, salviamo l'entrata nell'area corrente, se autorizzata/associata.
          await this.logspostamentoService.create({
            mmsi: data.mmsi,
            geoarea_id: current_geoarea.geoarea_id, spostamento: "ENTRATA"
          });
        }
      } else {
        // Dall'ultimo spostamento/dato inviato ricaviamo la sua geoarea.
        const last_geoarea = await this.geofenceareaService.getGeoareaByPosition(lastSpostamento.longitudine, lastSpostamento.latitudine);
        if (!last_geoarea) {
          throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
        }
        // Prima di tutto controlliamo se la geoarea precedente e corrente sono diverse, se lo sono c'è stata un'entrata ed un'uscita. Altrimenti, se sono uguali, non c'è stata nessuna uscita o entrata.
        if (last_geoarea.geoarea_id !== current_geoarea.geoarea_id) {

          const lastAreaIsAllowed: boolean = allowedGeoareas.some(g => g.geoarea_id === last_geoarea.geoarea_id);
          // CASO 1 : entrambe le zone sono autorizzate/associate. Quindi si deve loggare sia l'uscita che l'entrata.
          if (lastAreaIsAllowed && currentAreaIsAllowed) {
            ;
            // Si entra nella current_area, cioè la posizione che l'utente sta inviando.
            await this.logspostamentoService.create({
              mmsi: data.mmsi,
              geoarea_id: current_geoarea.geoarea_id, spostamento: "ENTRATA"
            });
            // Si esce dall'ultima area di cui è stata inviata la posizione.
            await this.logspostamentoService.create({ mmsi: data.mmsi, geoarea_id: last_geoarea.geoarea_id, spostamento: "USCITA" });
          }
          // CASO 2: la posizione precedente non era autorizzata, ma la corrente si. Quindi si logga solo l'entrata nell'area corrente.
          if (!lastAreaIsAllowed && currentAreaIsAllowed) {
            await this.logspostamentoService.create({
              mmsi: data.mmsi,
              geoarea_id: current_geoarea.geoarea_id, spostamento: "ENTRATA"
            });
          }
          // CASO 3: la posizione corrente non era autorizzata, ma la precedente si. Quindi si logga solo l'uscita dall'area precedente.
          if (lastAreaIsAllowed && !currentAreaIsAllowed) {
            await this.logspostamentoService.create({ mmsi: data.mmsi, geoarea_id: last_geoarea.geoarea_id, spostamento: "USCITA" });
          }
          // CASO 4: nessuna delle due aree è autorizzata, quindi non salviamo nulla.
        }
      }
      await this.datiinviatiDAO.create(data, t);
      await t.commit();
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError) {
        throw err;
      }
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }
  }
}

export default DatiInviatiService;