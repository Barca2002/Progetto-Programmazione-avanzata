import { LogSpostamentiDAO } from '../dao/LogSpostamentiDAO.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { LogSpostamentiCreationData } from '../models/LogSpostamentiModel.js';

export class LogSpostamentiService {
  private logSpostamentiDAO = new LogSpostamentiDAO();

  async create(data: LogSpostamentiCreationData){
;
    const t = await DatabaseConnection.getInstance().transaction();
    try { 
      const result = await this.logSpostamentiDAO.create(data, t);
      if(!result){
        throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
      }
      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
    

  }

}