import { DatiinviatiDAO } from '../dao/DatiInviatiDAO.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { ImbarcazioneDAO } from '../dao/ImbarcazioneDAO.js';
import { GeofenceImbarcazioniDAO } from '../dao/GeofenceImbarcazioniDAO.js';
import { DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
import { decodeJwt } from '../middlewares/JWTMiddleware.js';
import { ImbarcazioneService } from './ImbarcazioneService.js'; 

export class DatiInviatiService {
  private datiinviatiDAO = new DatiinviatiDAO();
  private imbarcazioneDAO = new ImbarcazioneDAO();
  private geofenceImbarcazioniDAO = new GeofenceImbarcazioniDAO();
  private imbarcazioniService = new ImbarcazioneService();

  // Si controlla se l'imbarcazione esiste (con l'mmsi), se l'utente che ha inviato la richiesta è il proprietario di essa e se le coordinate ricadono dentro una geoarea.
  public async sendData(data: DatiinviatiCreationData, user_id: number): Promise<void> {
    
    const imbarcazione = await this.imbarcazioneDAO.findById(data.mmsi);
    if (!imbarcazione){
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    }
    // Passiamo l'user_id estratto dal token JWT per controllare se è il proprietario della barca.
    await this.imbarcazioniService.checkOwnershipImbarcazione(user_id, data.mmsi);

    const connDB = DatabaseConnection.getInstance();
    const t = await connDB.transaction(); //Mi serve perche sia la create che gli updates devono andare a buon fine, altrimenti avrei dei risultati errati
    try {
      const geoarea_found = await this.datiinviatiDAO.checkLocationInGeoarea(data.mmsi, data.longitudine, data.latitudine);
      //Controllo se ha trovato una geoarea in cui risiede il punto
      if(geoarea_found){
        // Si resetta tutte le posizioni di quella barca
        await this.geofenceImbarcazioniDAO.resetLocation(data.mmsi, t);
        // Si aggiorna la posizione della barca settando is_in a true in base a dove si trova attualmente
        await this.geofenceImbarcazioniDAO.updateLocation(data.mmsi, geoarea_found.geoarea_id, t);
      } else {
        throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
      }
      //Inserisco i dati nel db
      await this.datiinviatiDAO.create(data, t);

      await t.commit();
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError) throw err;
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }
  }
}

export default DatiInviatiService;