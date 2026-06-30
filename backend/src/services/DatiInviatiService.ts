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

  //Torna l'ultimo dato inviato per quella imbarcazione. Può restituire null, perché serve nella funzione di sendData dell'utente. Se non c'è last dato vuole dire che è la prima volta che manda un dato.
  public async findLastDatoInviatoByMmsi(mmsi: number): Promise<Datiinviati | null> {
    const last_dato = await this.datiinviatiDAO.getLastDatoByMmsi(mmsi);
    if (!last_dato) {
      throw ErrorFactory.getError(AppErrorEnum.DATO_NOT_FOUND);
    }
    return last_dato;
  }


  public async sendData(data: DatiinviatiCreationData, user_id: number): Promise<void> {

    const imbarcazione = await this.imbarcazioneDAO.get(data.mmsi);
    if (!imbarcazione) {
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    }
    // Passiamo l'user_id estratto dal token JWT per controllare se è il proprietario della barca.
    await this.imbarcazioniService.checkOwnershipImbarcazione(user_id, data.mmsi);
    // Prendiamo tutte le geoaree associate alle imbarcazioni dell'utente.
    const geofence_imbarcazioni = DatabaseConnection.getInstance().model('geofence_imbarcazioni');
    const allowedGeoareas = await geofence_imbarcazioni.findAll({ where: { mmsi: data.mmsi } }) as unknown as { geoarea_id: number }[];

    const t = await DatabaseConnection.getInstance().transaction();
    try {
      // Prendiamo la geoarea corrispondente alla posizione inviata.
      const current_geoarea = await this.geofenceareaService.getGeoareaByPosition(data.longitudine, data.latitudine);
      console.log("--- CURRENT GEOAREA ----", current_geoarea?.geoarea_id)
      const currentAreaIsAllowed: boolean = allowedGeoareas.some(g => g.geoarea_id === current_geoarea?.geoarea_id);
      console.log(" ---- CURRENT GEOAREA IS ALLOWED -----", currentAreaIsAllowed);
      // Prendiamo l'ultimo spostamento/dato inviato per determinare la posizione precedente.
      const lastDatoInviato = await this.datiinviatiDAO.getLastDatoByMmsi(data.mmsi);
      console.log("---- LAST DATO -----", lastDatoInviato?.id)
      // Se lastDatoInviato è nullo, vuol dire che è il primo invio di dati perché non ci sono dati precedenti.
      // Inoltre, se non c'è un dato precedente, ma il dato attuale è in una geoarea, biosgna vedere se l'imbarcazione è associata ad essa. In caso positivo, si salva lo spostamento in entrata, altrimenti no.
      if (!lastDatoInviato) {
        if (current_geoarea && currentAreaIsAllowed) {
          await this.logspostamentoService.create({
            mmsi: data.mmsi,
            geoarea_id: current_geoarea.geoarea_id, spostamento: "ENTRATA"
          });
        }
        // Se l'area corrente è nulla o non è permessa o sono entrambi sono null e false, non salvo nessuno spostamento, ma solamente il dato.
        await this.datiinviatiDAO.create(data, t);
        await t.commit();
        return;
      }

      // Prendo la geoarea dell'ultimo dato inviato.
      const geoarea_of_last_dato = await this.geofenceareaService.getGeoareaByPosition(lastDatoInviato.longitudine, lastDatoInviato.latitudine);
      console.log("---- LAST GEOAREA ----", geoarea_of_last_dato?.geoarea_id);

      let lastAreaIsAllowed: boolean;
      // Se l'ultimo dato è nullo, ovviamnente l'ultima geoarea associata non può essere valida.
      if(!geoarea_of_last_dato){
        lastAreaIsAllowed = false;
      } else {
        lastAreaIsAllowed = allowedGeoareas.some(g => g.geoarea_id === geoarea_of_last_dato.geoarea_id);
      }
      console.log("---- LAST GEOAREA IS ALLOWED ----", lastAreaIsAllowed);

      // Se la posizione corrente è fuori dalle geoaree, ma quella precedente era dentro un'area, sto uscendo dall'ultima geoarea. Ovviamente bisogna controllare se è permessa l'ultima geoarea per salvare l'uscita.
      if (!current_geoarea) {

        if (!geoarea_of_last_dato) {
          // Se l'ultima posizione inviata è fuori da una geoarea, devo semplicemente salvare il dato.
          await this.datiinviatiDAO.create(data, t);
          await t.commit();
          return;
        }

        // Invece, se l'ultima posizione inviata è in una geoarea, vediamo se è associata all'imbarcazione corrente.
        if (lastAreaIsAllowed) {
          // Se la geoarea dell'ultima posizione inviata è permessa, vuol dire che si esce da essa.
          await this.logspostamentoService.create({ mmsi: data.mmsi, geoarea_id: geoarea_of_last_dato.geoarea_id, spostamento: "USCITA" });
        }

        // Inoltre, anche se l'ultima geoarea associata all'ultima posizione inviata non è permessa (cioè !lastAreaIsAllowed), non salvo nessuno spostamento, ma solo il dato. 
        await this.datiinviatiDAO.create(data, t);
        await t.commit();
        return;
      }
      // Se ci sono entrambi i dati, cioè la geoarea corrente e il dato precedente, bisogna vedere se sono associate all'imbarcazione.
      if (current_geoarea) {

        if (!geoarea_of_last_dato) {
          // Se l'ultima geoarea è nulla, devo vedere solo se quella corrente è associata e in caso positivo salvare lo spostamento in entrata
          if (currentAreaIsAllowed) {
            await this.logspostamentoService.create({
              mmsi: data.mmsi,
              geoarea_id: current_geoarea.geoarea_id, spostamento: "ENTRATA"
            });
          }
          await this.datiinviatiDAO.create(data, t);
          await t.commit();
          return;
        }

        // Controlliamo se la geoarea precedente e corrente sono diverse, se lo sono c'è stata un'entrata ed un'uscita. Altrimenti, se sono uguali, non c'è stata nessuna uscita o entrata, ma solo un movimento interno alla geoarea precedente.
        if (geoarea_of_last_dato.geoarea_id !== current_geoarea.geoarea_id) {

          // CASO 1 : entrambe le zone sono autorizzate/associate. Quindi si deve loggare sia l'uscita che l'entrata.
          if (lastAreaIsAllowed && currentAreaIsAllowed) {
            // Si esce dall'ultima area di cui è stata inviata la posizione.
            await this.logspostamentoService.create({ mmsi: data.mmsi, geoarea_id: geoarea_of_last_dato.geoarea_id, spostamento: "USCITA" });
            // Si entra nella current_area, cioè la posizione che l'utente sta inviando.
            await this.logspostamentoService.create({
              mmsi: data.mmsi,
              geoarea_id: current_geoarea.geoarea_id, spostamento: "ENTRATA"
            });
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
            await this.logspostamentoService.create({ mmsi: data.mmsi, geoarea_id: geoarea_of_last_dato.geoarea_id, spostamento: "USCITA" });
          }
          // CASO 4: nessuna delle due aree è autorizzata, quindi non salviamo nulla.
        }
        await this.datiinviatiDAO.create(data, t);
        await t.commit();
        return;
      }

      // Se l'ultimo dato (lastDatoInviato) e la current_geoarea sono nulli, vuol dire che siamo fuori da una geoarea e quindi va salvato solo il dato inviato, nessuno spostamento.
      await this.datiinviatiDAO.create(data, t);
      await t.commit();
      return;
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