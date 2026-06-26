import { Transaction } from 'sequelize';
import { LogSpostamenti, LogSpostamentiCreationData } from '../models/LogSpostamentiModel.js';

interface ILogSpostamenti {
  create(data: LogSpostamenti, t: Transaction): Promise<LogSpostamenti>;
}

export class LogSpostamentiDAO implements ILogSpostamenti {

  async create(data: LogSpostamentiCreationData, t: Transaction): Promise<LogSpostamenti> {
    return await LogSpostamenti.create({
      mmsi: data.mmsi,
      geoarea_id: data.geoarea_id,
      spostamento: data.spostamento
    }, { transaction: t , returning: true});
      
  }

}
