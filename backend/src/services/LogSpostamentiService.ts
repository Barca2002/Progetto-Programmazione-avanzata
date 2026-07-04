import { LogSpostamentiDAO } from '../dao/LogSpostamentiDAO.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { LogSpostamentiCreationData } from '../models/LogSpostamentiModel.js';
import { Transaction } from 'sequelize';

export class LogSpostamentiService {
  private readonly logSpostamentiDAO = new LogSpostamentiDAO();

  /**
   * Funzione che crea un nuovo log di spostamento, verificando che la creazione sia andata a buon fine
   * @param data oggetto che contiene i dati necessari per la creazione di un log di spostamento
   * @param t oggetto Transaction di Sequelize che rappresenta la transazione SQL attiva
   * @returns oggetto LogSpostamenti creato
   */
  public async create(data: LogSpostamentiCreationData, t: Transaction) {
    const result = await this.logSpostamentiDAO.create(data, t);
    if (!result) {
      throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
    }
    return result;
  }
}