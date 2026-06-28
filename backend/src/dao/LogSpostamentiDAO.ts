import { Transaction } from 'sequelize';
import { LogSpostamenti, LogSpostamentiCreationData } from '../models/LogSpostamentiModel.js';
import { InterfacciaDAO } from './InterfacciaDAO.js';

/*
export interface InterfacciaDAO<T>{
    create(item: T, t: Transaction): Promise<T>;
    get(item_id1: number, item_id2?: number): Promise<T | null>;
    getAll(): Promise<T[]>; 
    update(item_id: number, item_id2?: number, new_data?: Partial<T>, t?: Transaction): Promise<T | null>;
    delete(item_id1: number, item_id2?: number, t?: Transaction): Promise<T | null>;
}
*/

export class LogSpostamentiDAO implements InterfacciaDAO<LogSpostamenti> {

  async create(data: LogSpostamentiCreationData, t: Transaction): Promise<LogSpostamenti> {
    return await LogSpostamenti.create(data, {transaction: t});
  }

  async get(log_id: number, _item_id2?: number): Promise<LogSpostamenti | null> {
      return await LogSpostamenti.findByPk(log_id);
    }
  
  async getAll(): Promise<LogSpostamenti[]> {
    return await LogSpostamenti.findAll();
  }
  
  async update(log_id: number, _item_id2?: number, new_data?:Partial<LogSpostamentiCreationData>, t?: Transaction): Promise<LogSpostamenti | null> {
    const log_spostamento = await LogSpostamenti.findByPk(log_id);
    return await log_spostamento!.update(new_data!, {transaction: t!});
  }
  
  async delete(log_id: number, _item_id2?: number, t?: Transaction): Promise<LogSpostamenti | null> {
    const log_spostamento = await LogSpostamenti.findByPk(log_id);
    await log_spostamento!.destroy({ transaction: t! });
    return log_spostamento;
  }


}
