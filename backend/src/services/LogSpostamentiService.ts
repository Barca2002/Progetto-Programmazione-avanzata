import { LogSpostamentiDAO } from '../dao/LogSpostamentiDAO.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ImbarcazioneDAO } from '../dao/ImbarcazioneDAO.js';

export class LogSpostamentiService {
  private logSpostamentiDAO = new LogSpostamentiDAO();
  private imbarcazioneDAO = new ImbarcazioneDAO();

  async logSpostamento(spostamento: string, geoarea_id: number){
    
  }

}