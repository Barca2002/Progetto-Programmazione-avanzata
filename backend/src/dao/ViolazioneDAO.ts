import { Transaction } from 'sequelize';
import { Violazione, ViolazioneCreationData } from '../models/ViolazioneModel.js';
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

export class ViolazioneDAO implements InterfacciaDAO<Violazione> {

  async create(data: ViolazioneCreationData, t: Transaction): Promise<Violazione> {
    return await Violazione.create(data, {transaction: t});
  }

  async get(violazione_id: number, _item_id2?: number): Promise<Violazione | null> {
    return await Violazione.findByPk(violazione_id);
  }

  async getAll(): Promise<Violazione[]> {
    return await Violazione.findAll();
  }

  async findAllByMmsi(mmsi: number): Promise<Violazione[] | null> {
    return await Violazione.findAll({ where: { mmsi } });
  }

  async findAllByGeoarea(geoarea_id: number): Promise<Violazione[] | null> {
    return await Violazione.findAll({ where: { geoarea_id }, order: [["created_at", "DESC"]] });
  }

  async findAll(): Promise<Violazione[]> {
    return await Violazione.findAll();
  }

  async update(violazione_id: number, _item_id2?: number, new_data?:Partial<ViolazioneCreationData>, t?: Transaction): Promise<Violazione> {
    const violazione = await Violazione.findByPk(violazione_id);
    return await violazione!.update(new_data!, {transaction: t!});
  }

  async delete(user_id: number, _item_id2?: number, t?: Transaction): Promise<Violazione | null> {
      const violazione = await Violazione.findByPk(user_id);
      await violazione!.destroy({ transaction: t! });
      return violazione;
  }
}