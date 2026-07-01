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
import { LogSpostamentiCreationData } from '../models/LogSpostamentiModel.js';

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

    // Prendiamo la geoarea corrispondente alla posizione inviata.
    const current_geoarea = await this.geofenceareaService.getGeoareaByPosition(data.longitudine, data.latitudine);
    const currentAreaIsAllowed: boolean = current_geoarea ? await imbarcazione.hasGeofencearea(current_geoarea!.geoarea_id) : false;

    // Prendiamo l'ultimo spostamento/dato inviato per determinare la posizione precedente.
    const lastDatoInviato = await this.datiinviatiDAO.getLastDatoByMmsi(data.mmsi);

    // Prendiamo la geoarea associata all'ultimo dato inviato (se esiste un dato precedente, altrimenti è nullo).
    const geoarea_of_last_dato = lastDatoInviato
      ? await this.geofenceareaService.getGeoareaByPosition(lastDatoInviato.longitudine, lastDatoInviato.latitudine)
      : null;

    // Se non c'è un'ultima geoarea (sia perché non c'è un dato precedente, sia perché il dato precedente non era in nessuna area), non può essere permessa.
    const lastAreaIsAllowed = geoarea_of_last_dato
      ? (await imbarcazione.hasGeofencearea(geoarea_of_last_dato.geoarea_id))
      : false;

    // Se le due geoaree coincidono (stessa area, sia essa nulla o la stessa geoarea), non c'è nessun ingresso/uscita da registrare:
    // è solo un movimento interno alla stessa area, oppure il dato è fuori da ogni area sia ora che prima. Il caso se entrambe le aree sono nulle, cioè siamo fuori dalle geoarea sia ora che prima, è gestito perché undefined === undefined è true.
    const sameArea = current_geoarea?.geoarea_id === geoarea_of_last_dato?.geoarea_id;

    const spostamentiDaLoggare:LogSpostamentiCreationData[] = [];

    if (!sameArea) {
      // Si esce dall'area precedente solo se esisteva un'area precedente ed era permessa per l'imbarcazione.
      if (geoarea_of_last_dato && lastAreaIsAllowed) {
        spostamentiDaLoggare.push({ mmsi: data.mmsi, geoarea_id: geoarea_of_last_dato.geoarea_id, spostamento: "USCITA" });
      }
      // Si entra nell'area corrente solo se esiste l'area corrente ed è permessa per l'imbarcazione.
      if (current_geoarea && currentAreaIsAllowed) {
        spostamentiDaLoggare.push({ mmsi: data.mmsi, geoarea_id: current_geoarea.geoarea_id, spostamento: "ENTRATA" });
      }
      // Se sono entrambi falsi, vuol dire che o sono sempre fuori o che non c'è il permesso per entrambe le geoaree e quindi non loggo nessuno spostamento.
    }

    const t = await DatabaseConnection.getInstance().transaction();
    try {
      // Salviamo gli spostamenti, se ci sono.
      for (const spostamento of spostamentiDaLoggare) {
        await this.logspostamentoService.create(spostamento, t);
      }
      // Il dato va sempre salvato, indipendentemente dagli spostamenti generati.
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