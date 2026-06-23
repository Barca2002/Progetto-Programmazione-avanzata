import { DatiinviatiDAO } from '../dao/DatiInviatiDAO.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { UserImbarcazioniDAO } from '../dao/UserImbarcazioniDAO.js';
import { GeofenceImbarcazioniDAO } from '../dao/GeofenceImbarcazioniDAO.js';
import { DatiinviatiCreationData } from '../models/DatiInviatiModel.js';

export class DatiInviatiService {
  private datiinviatiDAO = new DatiinviatiDAO();
  private userImbarcazioniDAO = new UserImbarcazioniDAO();
  private geofenceImbarcazioniDAO = new GeofenceImbarcazioniDAO();


  public async sendData(data: DatiinviatiCreationData): Promise<void> {
    
    if (!data.mmsi || isNaN(data.mmsi) || data.mmsi.toString().length !== 9)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI);

    if (!data.latitudine || isNaN(data.latitudine) || data.latitudine < -90 || data.latitudine > 90)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_LATITUDINE);

    if (!data.longitudine || isNaN(data.longitudine) || data.longitudine < -180 || data.longitudine > 180)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_LONGITUDINE);

    if (!data.velocita_kmh || isNaN(data.velocita_kmh) || data.velocita_kmh < 0 || data.velocita_kmh > 200)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_VELOCITA);

    if (!data.stato || !['IN NAVIGAZIONE', 'IN PESCA', 'STAZIONARIO'].includes(data.stato))
      throw ErrorFactory.getError(AppErrorEnum.INVALID_STATO);
    
    const user = await this.userImbarcazioniDAO.findUserByMmsi(data.mmsi);
    if (!user)
      throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
    
    const imbarcazione = await this.userImbarcazioniDAO.findAssociation(user.user_id, data.mmsi);
    if (!imbarcazione)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

    const connDB = DatabaseConnection.getInstance();
    const t = await connDB.transaction(); //Mi serve perche sia la create che gli updates devono andare a buon fine, altrimenti avrei dei risultati errati

    try {
      //Inserisco i dati nel db, con una transaction metto in sospeso
      await this.datiinviatiDAO.create(data, t);

      const geoarea_found = await this.datiinviatiDAO.checkLocationInGeoarea(data.mmsi, data.latitudine, data.longitudine); //uso data.mmsi e non user_id perche una data.mmsi è associata ad un user quindi è uguale
      
      //Controllo se esiste la 
      if(geoarea_found){
        // Si resetta tutte le posizioni di quella barca
        await this.geofenceImbarcazioniDAO.resetLocation(data.mmsi, t);
        // Si aggiorna la posizione della barca settando is_in a true in base a dove si trova attualmente
        await this.geofenceImbarcazioniDAO.updateLocation(data.mmsi, geoarea_found.geoarea_id, t);
      }
      else 
        throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);

      if(!await this.datiinviatiDAO.checkVelocity(geoarea_found, data.velocita_kmh))
          throw ErrorFactory.getError(AppErrorEnum.MAX_SPEED_LIMIT);

      await t.commit();
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError) throw err;
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }
  }
}

export default DatiInviatiService;