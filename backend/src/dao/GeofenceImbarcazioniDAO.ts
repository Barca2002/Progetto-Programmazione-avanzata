import { Transaction } from 'sequelize';
import { GeofenceImbarcazioni, GeofenceImbarcazioniCreationData } from '../models/GeofenceImbarcazioniModel.js';
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

export class GeofenceImbarcazioniDAO implements InterfacciaDAO<GeofenceImbarcazioni> {
  async create(data: GeofenceImbarcazioniCreationData, t: Transaction): Promise<GeofenceImbarcazioni> {
      return await GeofenceImbarcazioni.create(data, {transaction:t});
  }

  // Funzione per trovare l'associazione tra la geoarea e l'imbarcazione. Bisogna passare anche la transazione perché lavoriamo con operazioni sospese e bisogna controllare anche in esse.
  async get(geoarea_id: number, mmsi: number): Promise<GeofenceImbarcazioni | null> {
      return await GeofenceImbarcazioni.findOne({
        where: { geoarea_id, mmsi }});
  }

  async getAll(): Promise<GeofenceImbarcazioni[]> {
      return await GeofenceImbarcazioni.findAll();
  }

  async getAllByMmsi(mmsi: number): Promise<GeofenceImbarcazioni[]> {
    return await GeofenceImbarcazioni.findAll({where: { mmsi }});
  }
  
  async update(geoarea_id: number, mmsi: number, new_data: Partial<GeofenceImbarcazioniCreationData>, t: Transaction): Promise<GeofenceImbarcazioni | null> {
    const geoarea_imbarcazione = await GeofenceImbarcazioni.findOne({where: { geoarea_id, mmsi }});
    return await geoarea_imbarcazione!.update(new_data, {transaction: t});
  }
    
  async delete(geoarea_id: number, mmsi: number, t: Transaction): Promise<GeofenceImbarcazioni | null> {
    const geoarea_imbarcazione = await GeofenceImbarcazioni.findOne({where: { geoarea_id, mmsi }});
    await geoarea_imbarcazione!.destroy({transaction: t});
    return geoarea_imbarcazione;
  }
}