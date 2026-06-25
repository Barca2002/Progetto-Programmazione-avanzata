import { DatiinviatiDAO } from '../dao/DatiInviatiDAO.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { AppError } from '../models/AppErrorModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { ImbarcazioneDAO } from '../dao/ImbarcazioneDAO.js';
import { GeofenceImbarcazioniDAO } from '../dao/GeofenceImbarcazioniDAO.js';
import { DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
import { ImbarcazioneService } from './ImbarcazioneService.js'; 
import { LogSpostamentiService } from './LogSpostamentiService.js';

export class DatiInviatiService {
  private datiinviatiDAO = new DatiinviatiDAO();
  private imbarcazioneDAO = new ImbarcazioneDAO();
  private geofenceImbarcazioniDAO = new GeofenceImbarcazioniDAO();
  private imbarcazioniService = new ImbarcazioneService();
  private logspostamentoService = new LogSpostamentiService();

  // Si controlla se l'imbarcazione esiste (con l'mmsi), se l'utente che ha inviato la richiesta è il proprietario di essa e se le coordinate ricadono dentro una geoarea.
  public async sendData(data: DatiinviatiCreationData, user_id: number): Promise<void> {
    
    const imbarcazione = await this.imbarcazioneDAO.findById(data.mmsi);
    if (!imbarcazione){
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    }
    // Passiamo l'user_id estratto dal token JWT per controllare se è il proprietario della barca.
    await this.imbarcazioniService.checkOwnershipImbarcazione(user_id, data.mmsi);
    const allowedGeoareas = this.geofenceImbarcazioniDAO.findAllByMmsi(data.mmsi);

    const t = await DatabaseConnection.getInstance().transaction();
    try {
      const current_geoarea = await this.datiinviatiDAO.checkLocationInGeoarea(data.mmsi, data.longitudine, data.latitudine);
      //Controllo se ha trovato una geoarea in cui risiede il punto
      if(current_geoarea){
        const lastSpostamento = await this.imbarcazioneDAO.findLastDatoInviato(data.mmsi);
        if(!lastSpostamento){
          throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR); // Da cambiare
        }
        const lastGeoarea = await this.datiinviatiDAO.checkLocationInGeoarea(data.mmsi, lastSpostamento.longitudine, lastSpostamento.latitudine);

        if((await allowedGeoareas).some(g => g.geoarea_id === lastGeoarea?.geoarea_id) ){
          if(lastGeoarea?.geoarea_id == current_geoarea.geoarea_id){
            await this.logspostamentoService.logSpostamento("ENTRATA", current_geoarea.geoarea_id);
            await this.logspostamentoService.logSpostamento("USCITA", lastGeoarea.geoarea_id);
          }
        }
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