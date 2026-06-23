import { QueryTypes, Transaction } from 'sequelize';
import { Geofencearea, GeofenceareaCreationData } from '../models/GeofenceareaModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { Position } from 'geojson';
import { DatabaseConnection } from '../singleton/DBConnection.js';

interface IGeofenceareaDAO {
  create(data: GeofenceareaCreationData, t: Transaction): Promise<Geofencearea>;
  findById(geoarea_id: number): Promise<Geofencearea | null>;
  findByCoords(coords: Position[][]): Promise<Geofencearea | null>;
  findAll(): Promise<Geofencearea[]>;
  findByName(name: string): Promise<Geofencearea | null>;
  update(geoarea_id: number, data: Partial<GeofenceareaCreationData>, t:Transaction): Promise<Geofencearea>;
  delete(geoarea_id: number, t:Transaction): Promise<number>;
}

export class GeofenceareaDAO implements IGeofenceareaDAO {
  async create(data: GeofenceareaCreationData, t: Transaction): Promise<Geofencearea> {
  try {
    return await Geofencearea.create(data, {transaction: t});
  } catch (err) {
    throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
  }
}

  async findById(geoarea_id: number): Promise<Geofencearea | null> {
    try {
      return await Geofencearea.findByPk(geoarea_id);
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  async findByCoords(coords: Position[][]): Promise<Geofencearea | null> {
    const geoJson = {
      type: "Polygon",
      coordinates: coords 
      /*
      coords     = 
      [                                                                                 
        [                                                           --
          [125.6, 10.1], [124.6, 10], [124, 9.5], [125.6, 10.1]     -- <- Position[]        
        ]                                                           --
      ] → Position[][]
      */
    };
    const db = DatabaseConnection.getInstance();
    const results = await db.query(`SELECT ga.* FROM geofence_areas ga WHERE ST_Covers(ga.area, ST_SetSRID(ST_GeomFromGeoJSON(:geojson), 4326)) LIMIT 1`,
      {
        replacements: 
        {
          geojson: JSON.stringify(geoJson)
        },
        type: QueryTypes.SELECT,
        model: Geofencearea,
        mapToModel: true
      }
    );
    return results.length > 0 ? results[0]! : null;
  }

  async findAll(): Promise<Geofencearea[]> {
    try{
      return await Geofencearea.findAll();
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }
  

  async findByName(name: string): Promise<Geofencearea | null> {
    // Stessa logica di findByEmail/findByUsername: serve poter restituire null senza lanciare errore
    return await Geofencearea.findOne({ where: { name } });
  }

  async update(geoarea_id: number, data: Partial<GeofenceareaCreationData>, t: Transaction): Promise<Geofencearea> {
    try{
      const [, affectedRows] = await Geofencearea.update(data, { where: { geoarea_id }, transaction: t, returning: true });
      return affectedRows[0]!;
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.UPDATE_ERROR);
    }
  }

  async delete(geoarea_id: number, t:Transaction): Promise<number> {
    try{
      return await Geofencearea.destroy({ where: { geoarea_id }, transaction: t });
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
    }

  }
}
