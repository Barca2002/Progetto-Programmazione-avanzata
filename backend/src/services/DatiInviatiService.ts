import { DatiinviatiDAO } from '../dao/DatiInviatiDAO.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { UserImbarcazioniDAO } from '../dao/UserImbarcazioniDAO.js';
import { GeofenceImbarcazioniDAO } from '../dao/GeofenceImbarcazioniDAO.js';

export class DatiInviatiService {
  private datiinviatiDAO = new DatiinviatiDAO();
  private userImbarcazioniDAO = new UserImbarcazioniDAO();
  private geofenceImbarcazioniDAO = new GeofenceImbarcazioniDAO();


  async sendData(user_id: number, mmsi: number, latitudine: number, longitudine: number, velocita_kmh: number, stato: string): Promise<void> {
    
    if (!mmsi || isNaN(mmsi) || mmsi.toString().length !== 9)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI);

    if (!latitudine || isNaN(latitudine) || latitudine < -90 || latitudine > 90)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_LATITUDINE);

    if (!longitudine || isNaN(longitudine) || longitudine < -180 || longitudine > 180)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_LONGITUDINE);

    if (!velocita_kmh || isNaN(velocita_kmh) || velocita_kmh < 0 || velocita_kmh > 200)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_VELOCITA);

    if (!stato || !['IN NAVIGAZIONE', 'IN PESCA', 'STAZIONARIO'].includes(stato))
      throw ErrorFactory.getError(AppErrorEnum.INVALID_STATO);
    
    const imbarcazione = await this.userImbarcazioniDAO.findAssociation(user_id, mmsi);

    if (!imbarcazione)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

    const t = await DatabaseConnection.getInstance().transaction(); //Mi serve perche sia la create che gli updates devono andare a buon fine, altrimenti avrei dei risultati errati

    try {
      //Inserisco i dati nel db, con una transaction metto in sospeso
      await this.datiinviatiDAO.create({ mmsi, latitudine, longitudine, velocita_kmh, stato }, t);

      const geoarea_found = await this.datiinviatiDAO.checkLocationInGeoarea(DatabaseConnection.getInstance(), mmsi, latitudine, longitudine); //uso mmsi e non user_id perche una mmsi è associata ad un user quindi è uguale

      // Si resetta tutte le posizioni di quella barca
      await this.geofenceImbarcazioniDAO.resetLocation(mmsi, t);

      if(!geoarea_found){
      // Si aggiorna la posizione della barca settando is_in a true in base a dove si trova attualmente
      await this.geofenceImbarcazioniDAO.updateLocation(mmsi, geoarea_found!.geoarea_id, t);
      }
      

      await t.commit();
    } catch (err) {
      console.log(err);
      await t.rollback();
      if (err instanceof AppError) throw err;
        throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }
}

export default DatiInviatiService;