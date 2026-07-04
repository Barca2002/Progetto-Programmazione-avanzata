import { Transaction } from 'sequelize';
import { LogSpostamenti, LogSpostamentiCreationData } from '../models/LogSpostamentiModel.js';
import { InterfacciaDAO } from './InterfacciaDAO.js';

export class LogSpostamentiDAO implements InterfacciaDAO<LogSpostamenti> {

  public async create(data: LogSpostamentiCreationData, t: Transaction): Promise<LogSpostamenti> {
    return await LogSpostamenti.create(data, {transaction: t});
  }

  public async get(log_id: number): Promise<LogSpostamenti | null> {
      return await LogSpostamenti.findByPk(log_id);
  }

  /**
   * Restituisce l'ultimo spostamento effettuato da un'imbaracazione in una geofence area.
   * @param mmsi numero che rappresenta l'id dell'imbarcazione.
   * @param geoarea_id numero che rappresenta l'id della geofence area.
   * @returns oggetto Logspostamenti o null.
   */
  public async getLastByMmsiAndGeoarea(mmsi: number, geoarea_id: number): Promise<LogSpostamenti | null> {
      return await LogSpostamenti.findOne({where: {mmsi: mmsi, geoarea_id: geoarea_id}, order: [['created_at', 'DESC']]});
  }
  
  public async getAll(): Promise<LogSpostamenti[]> {
    return await LogSpostamenti.findAll();
  }
  
  public async update(log_id: number,new_data:Partial<LogSpostamentiCreationData>, t: Transaction): Promise<LogSpostamenti | null> {
    const log_spostamento = await LogSpostamenti.findByPk(log_id);
    return await log_spostamento!.update(new_data, {transaction: t});
  }
  
  public async delete(log_id: number, t: Transaction): Promise<LogSpostamenti | null> {
    const log_spostamento = await LogSpostamenti.findByPk(log_id);
    await log_spostamento!.destroy({ transaction: t });
    return log_spostamento;
  }


}
