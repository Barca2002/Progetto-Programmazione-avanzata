import { DatiinviatiDAO } from '../dao/DatiInviatiDAO.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { GeofenceImbarcazioni } from '../models/GeofenceImbarcazioniModel.js';
import { AppError } from '../models/AppErrorModel.js';

export class DatiInviatiService {
  private datiinviatiDAO = new DatiinviatiDAO();

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

    const db = DatabaseConnection.connect();
    const UserImbarcazioni = db.models.user_imbarcazioni!;
    const imbarcazione = await UserImbarcazioni.findOne({ where: { user_id, mmsi } });

    if (!imbarcazione)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);

    const t = await db.transaction(); //Mi serve perche sia la create che gli updates devono andare a buon fine, altrimenti avrei dei risultati errati

    try {
      //Inserisco i dati nel db, con una transaction metto in sospeso
      await this.datiinviatiDAO.create({ mmsi, latitudine, longitudine, velocita_kmh, stato }, t);

      const geoaree_found = await this.datiinviatiDAO.checkLocationInGeoarea(db, mmsi, latitudine, longitudine); //uso mmsi e non user_id perche una mmsi è associata ad un user quindi è uguale

      //Aggiorno per quella imbarcazione la posizione resettando le altre, perche conta l'ultima posizione inserita (sempre con una transaction)
      await GeofenceImbarcazioni.update(
        { is_in: false },
        { where: { mmsi }, transaction: t }
      );

      //Metto true solo dove si trova adesso (sempre con una transaction)
      // (Puo essere che alcune geoaree si sovrappongono parzialmente o totalmente e il verifica me le caccia entrambe, quindi l'utente è in entrambe le geoaree)
      for (const geoarea of geoaree_found) {
        await GeofenceImbarcazioni.update(
          { is_in: true },
          { where: { mmsi, geoarea_id: geoarea.geoarea_id }, transaction: t }
        );
      }

      await t.commit();
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError) throw err;
        throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }
}

export default DatiInviatiService;