import { Datiinviati } from '../models/DatiInviatiModel.js';
import { DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
import { QueryTypes, Transaction } from 'sequelize';
import { Geofencearea } from '../models/GeofenceareaModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { LogSpostamenti } from '../models/LogSpostamentiModel.js';

interface ILogSpostamenti {
  create(data: LogSpostamenti, t: Transaction): Promise<LogSpostamenti>;
}

export class LogSpostamentiDAO implements ILogSpostamenti {

  async create(data: LogSpostamenti, t: Transaction): Promise<LogSpostamenti> {
      return await LogSpostamenti.create({
        mmsi: data.mmsi,
        geoarea_id: data.geoarea_id,
        spostamento: data.spostamento,
        created_at: Date.now()
      }, { transaction: t });
  }

}
