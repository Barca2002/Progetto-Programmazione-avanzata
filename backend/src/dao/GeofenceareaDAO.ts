import { Transaction } from 'sequelize';
import { Geofencearea, GeofenceareaCreationData } from '../models/GeofenceareaModel.js';
import { InterfacciaDAO } from './InterfacciaDAO.js';

export class GeofenceareaDAO implements InterfacciaDAO<Geofencearea> {
  async create(data: GeofenceareaCreationData, t: Transaction): Promise<Geofencearea> {
    return await Geofencearea.create(data, { transaction: t });
  }

  async get(geoarea_id: number, _item_id2?: number): Promise<Geofencearea | null> {
    return await Geofencearea.findByPk(geoarea_id);
  }

  async getAll(): Promise<Geofencearea[]> {
    return await Geofencearea.findAll();
  }

  async findByName(name: string): Promise<Geofencearea | null> {
    return await Geofencearea.findOne({ where: { name } });
  }

  async update(geoarea_id: number, new_data: Partial<GeofenceareaCreationData>, t: Transaction): Promise<Geofencearea | null> {
    const geoarea = await Geofencearea.findByPk(geoarea_id);
    return await geoarea!.update(new_data, { transaction: t });
  }

  async delete(geoarea_id: number, t: Transaction): Promise<Geofencearea | null> {
    const geoarea = await Geofencearea.findByPk(geoarea_id);
    await geoarea!.destroy({ transaction: t });
    return geoarea;
  }
}
