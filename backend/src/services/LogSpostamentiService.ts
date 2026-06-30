import { LogSpostamentiDAO } from '../dao/LogSpostamentiDAO.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { LogSpostamentiCreationData } from '../models/LogSpostamentiModel.js';
import { Transaction } from 'sequelize';

export class LogSpostamentiService {
  private readonly logSpostamentiDAO = new LogSpostamentiDAO();

  async create(data: LogSpostamentiCreationData, t: Transaction){
      const result = await this.logSpostamentiDAO.create(data, t);
      if(!result){
        throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
      }
      return result; 
  }
}