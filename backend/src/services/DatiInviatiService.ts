import { DatiinviatiDAO } from '../dao/DatiInviatiDAO.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';

export class DatiInviatiService {
  private datiinviatiDAO = new DatiinviatiDAO();

  async inviaDati(user_id: number, mmsi: number, latitudine: number, longitudine: number, velocita_kmh: number, stato: string): Promise<void> {
    
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

    await this.datiinviatiDAO.create({ mmsi, latitudine, longitudine, velocita_kmh, stato });
  }
}

export default DatiInviatiService;