import { QueryTypes, Transaction } from 'sequelize';
import { Geofencearea, GeofenceareaCreationData } from '../models/GeofenceareaModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { Position } from 'geojson';
import { DatabaseConnection } from '../singleton/DBConnection.js';

interface IGeofenceareaDAO {
  create(data: GeofenceareaCreationData, t: Transaction): Promise<Geofencearea>;
  findById(geoarea_id: number): Promise<Geofencearea | null>;
  // Spostare nel service
  findByCoords(coords: Position[][]): Promise<Geofencearea | null>;
  findAll(): Promise<Geofencearea[]>;
  // Spostare nel service
  findByName(name: string): Promise<Geofencearea | null>;
  update(geoarea_id: number, data: Partial<GeofenceareaCreationData>, t:Transaction): Promise<Geofencearea>;
  delete(geoarea_id: number, t:Transaction): Promise<number>;
}

export class GeofenceareaDAO implements IGeofenceareaDAO {
  async create(data: GeofenceareaCreationData, t: Transaction): Promise<Geofencearea> {
    return await Geofencearea.create(data, {transaction: t});
}

  async findById(geoarea_id: number): Promise<Geofencearea | null> {
    return await Geofencearea.findByPk(geoarea_id);
  }

  async findByCoords(coords: Position[][]): Promise<Geofencearea | null> {
    const geoJson = {
      type: "Polygon",
      coordinates: coords 
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
    return await Geofencearea.findAll();
  }
  

  async findByName(name: string): Promise<Geofencearea | null> {
    // Stessa logica di findByEmail/findByUsername: serve poter restituire null senza lanciare errore
    return await Geofencearea.findOne({ where: { name } });
  }

  async update(geoarea_id: number, data: Partial<GeofenceareaCreationData>, t: Transaction): Promise<Geofencearea> {
      const [, affectedRows] = await Geofencearea.update(data, { where: { geoarea_id }, transaction: t, returning: true });
      return affectedRows[0]!;
  }

  async delete(geoarea_id: number, t:Transaction): Promise<number> {
    return await Geofencearea.destroy({ where: { geoarea_id }, transaction: t });
  }
}
