import { GeofenceareaDAO } from "../dao/GeofenceareaDAO.js";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import { DatabaseConnection } from "../singleton/DBConnection.js";
import { Geofencearea, GeofenceareaCreationData } from "../models/GeofenceareaModel.js";
import { Position } from "geojson";
import { QueryTypes } from "sequelize";
import { AppError } from "../models/AppErrorModel.js";

export class GeofenceareaService {
  private readonly geofenceareaDAO = new GeofenceareaDAO();

  /**
   * Funzione che restituisce una geofence area in base a delle coordinate o niente se non corrispondono ad una geofence area.
   * @param coords 
   * @returns 
   */
  public async findByCoords(coords: Position[][]): Promise<Geofencearea | null> {
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

  /**
   * Ritorna un oggetto Geofencearea in base alle coordinate fornite.
   * @param id numero che rappresenta l'id della geofence area.
   * @returns oggetto Geofence area
   */
  public async getAreaByCoords(coords: Position[][]) {
    const area = await this.findByCoords(coords);
    if (!area) {
      throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
    }
    return area;
  };

  /**
   * Ritorna un oggetto Geofencearea in base all'id fornito.
   * @param id numero che rappresenta l'id della geofence area.
   * @returns oggetto Geofence area
   */
  public async getAreaById(id: number) {
    if (Number.isNaN(id) || id <= 0)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_GEOAREA_ID);
    const area = await this.geofenceareaDAO.get(id);
    if (!area) {
      throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
    }
    return area;
  }

  /**
   * Funzione che crea una nuova geofence area.
   * @param data oggetto che implementa l'interfaccia GeofenceareaCreationData, quindi che contiene tutti i dati necessari per la creazione.
   * @returns oggetto Geofencearea.
   */
  public async createArea(data: GeofenceareaCreationData) {
    if (await this.findByCoords(data.area.coordinates) || await this.geofenceareaDAO.findByName(data.name)) {
      throw ErrorFactory.getError(AppErrorEnum.GEOAREA_ALREADY_EXISTS)
    }
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      const result = await this.geofenceareaDAO.create(data, t);
      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError)
        throw err;
      throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
    }
  }

  /**
   * Funzione che ritorna una geofence area in base ad una posizione (latitudine e longitudine)
   * @param longitudine numero che rappresenta una longitudine.
   * @param latitudine numero che rappresenta una latitudine.
   * @returns oggetto Geoarea o null
   */
  public async getGeoareaByPosition(longitudine: number, latitudine: number): Promise<Geofencearea | null> {
    const db = DatabaseConnection.getInstance();
    const results = await db.query(`SELECT ga.* FROM geofence_areas ga WHERE ST_Within(ST_SetSRID(ST_MakePoint(:longitudine, :latitudine), 4326), ga.area)LIMIT 1`,
      {
        replacements: { latitudine: latitudine, longitudine: longitudine },
        type: QueryTypes.SELECT,
        model: Geofencearea,
        mapToModel: true
      });
    return results.length > 0 ? (results[0] as Geofencearea) : null;
  }
}