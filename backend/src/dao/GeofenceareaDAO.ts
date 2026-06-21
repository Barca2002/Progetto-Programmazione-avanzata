import { Transaction } from 'sequelize';
import { Geofencearea, GeofenceareaCreationData } from '../models/GeofenceareaModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';

interface IGeofenceareaDAO {
  create(data: GeofenceareaCreationData): Promise<Geofencearea>;
  findById(geoarea_id: number, t?: Transaction): Promise<Geofencearea | null>;
  findAll(): Promise<Geofencearea[]>;
  findByName(name: string): Promise<Geofencearea | null>;
  update(geoarea_id: number, data: Partial<GeofenceareaCreationData>): Promise<number>;
  delete(geoarea_id: number): Promise<number>;
}

export class GeofenceareaDAO implements IGeofenceareaDAO {
  async create(data: GeofenceareaCreationData): Promise<Geofencearea> {
  try {
    let area = await Geofencearea.create(data);
    return area;
  } catch (err) {
    throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
  }
}

  async findById(geoarea_id: number, t?: Transaction): Promise<Geofencearea | null> {
  try {
    if (t) {
      return await Geofencearea.findByPk(geoarea_id, { transaction: t });
    }
    return await Geofencearea.findByPk(geoarea_id);
  } catch (err) {
    throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
  }
}

  async findAll(): Promise<Geofencearea[]> {
    try{
      return await Geofencearea.findAll();
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async findByName(name: string): Promise<Geofencearea | null> {
    // Stessa logica di findByEmail/findByUsername: serve poter restituire null senza lanciare errore
    return await Geofencearea.findOne({ where: { name } });
  }

  async update(geoarea_id: number, data: Partial<GeofenceareaCreationData>): Promise<number> {
    try{
      const [affectedCount] = await Geofencearea.update(data, { where: { geoarea_id } });
      return affectedCount;
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async delete(geoarea_id: number): Promise<number> {
    try{
      return await Geofencearea.destroy({ where: { geoarea_id } });
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }

  }
}

export default GeofenceareaDAO;