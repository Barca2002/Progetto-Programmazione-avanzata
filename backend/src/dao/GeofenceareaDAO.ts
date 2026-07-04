import { Transaction } from 'sequelize';
import { Geofencearea, GeofenceareaCreationData } from '../models/GeofenceareaModel.js';
import { InterfacciaDAO } from './InterfacciaDAO.js';

export class GeofenceareaDAO implements InterfacciaDAO<Geofencearea> {
  public async create(data: GeofenceareaCreationData, t: Transaction): Promise<Geofencearea> {
    return await Geofencearea.create(data, { transaction: t });
  }

  /**
   * Funzione che ritorna una geofence area con l'id passato come parametro nella funzione o null in caso non venga trovata una geofence area
   * @param geoarea_id 
   * @returns oggetto Geofencearea o null
   */
  public async get(geoarea_id: number): Promise<Geofencearea | null> {
    return await Geofencearea.findByPk(geoarea_id);
  }

  public async getAll(): Promise<Geofencearea[]> {
    return await Geofencearea.findAll();
  }

  public async findByName(name: string): Promise<Geofencearea | null> {
    return await Geofencearea.findOne({ where: { name } });
  }

  public async update(geoarea_id: number, new_data: Partial<GeofenceareaCreationData>, t: Transaction): Promise<Geofencearea | null> {
    const geoarea = await Geofencearea.findByPk(geoarea_id);
    return await geoarea!.update(new_data, { transaction: t });
  }

  public async delete(geoarea_id: number, t: Transaction): Promise<Geofencearea | null> {
    const geoarea = await Geofencearea.findByPk(geoarea_id);
    await geoarea!.destroy({ transaction: t });
    return geoarea;
  }
}
