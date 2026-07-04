import { DatiinviatiDAO } from '../dao/DatiInviatiDAO.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { ImbarcazioneDAO } from '../dao/ImbarcazioneDAO.js';
import { DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
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

  /**
   * Controlla che l'imbarcazione passati nei dati esista e sia di proprietà dell'utente che invia i dati. Poi si effettuano dei controlli se l'utente è autorizzato ad accedere alla geofence area corrente e la geofence area dell'ultimo dato inviato. Se vi è l'autorizzazione, si registrerà uno spostamento in uscita o in entrata. Se è il primo invio di dati, si registrerà solamente un'entrata (se la posizione inviata è in una geofence area e si ha l'autorizzazione). Se la geofence area della posizione corrente e dell'ultimo dato inviato sono uguali, non si registra nessuno spostamento, perché è solo un movimento interno ad essa.
   * @param data oggetto contenente tutti i dati necessari per l'invio della propria posizione.
   * @param user_id numero che rappresenta l'id dell'utente.
   */
  public async sendData(data: DatiinviatiCreationData, user_id: number): Promise<void> {
    const imbarcazione = await this.imbarcazioneDAO.get(data.mmsi);
    if (!imbarcazione) {
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    }
    await this.imbarcazioniService.checkOwnershipImbarcazione(user_id, data.mmsi);
    const current_geoarea = await this.geofenceareaService.getGeoareaByPosition(data.longitudine, data.latitudine);
    const currentAreaIsAllowed: boolean = current_geoarea ? await imbarcazione.hasGeofencearea(current_geoarea.geoarea_id) : false;
    const lastDatoInviato = await this.datiinviatiDAO.getLastDatoByMmsi(data.mmsi);
    const last_dato_geoarea = lastDatoInviato
      ? await this.geofenceareaService.getGeoareaByPosition(lastDatoInviato.longitudine, lastDatoInviato.latitudine)
      : null;
    const lastAreaIsAllowed = last_dato_geoarea
      ? (await imbarcazione.hasGeofencearea(last_dato_geoarea.geoarea_id))
      : false;
    const sameArea = current_geoarea?.geoarea_id === last_dato_geoarea?.geoarea_id;
    const spostamentiDaLoggare:LogSpostamentiCreationData[] = [];
    if (!sameArea) {
      if (last_dato_geoarea && lastAreaIsAllowed) {
        spostamentiDaLoggare.push({ mmsi: data.mmsi, geoarea_id: last_dato_geoarea.geoarea_id, spostamento: "USCITA" });
      }
      if (current_geoarea && currentAreaIsAllowed) {
        spostamentiDaLoggare.push({ mmsi: data.mmsi, geoarea_id: current_geoarea.geoarea_id, spostamento: "ENTRATA" });
      }
    }
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      for (const spostamento of spostamentiDaLoggare) {
        await this.logspostamentoService.create(spostamento, t);
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