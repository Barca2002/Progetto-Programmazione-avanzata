import { LogSpostamentiDAO } from '../dao/LogSpostamentiDAO.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';

export class LogSpostamentiService {
  private logSpostamentiDAO = new LogSpostamentiDAO();

  async getAllImbarcazioniConSegnalazioni() {
    const result = await this.logSpostamentiDAO.findAllConImbarcazioni();
    console.log(result);
    if (!result || result.length === 0)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND);
    return result;
  }
}