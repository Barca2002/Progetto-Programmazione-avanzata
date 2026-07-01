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


  public async getAree() {
    const aree = await this.geofenceareaDAO.getAll();
    if (!aree || aree.length === 0)
      throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
    return aree;
  };

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

  public async getAreaByCoords(coords: Position[][]) {
    const area = await this.findByCoords(coords);
    if (!area) {
      throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
    }
    return area;
  };

  public async getAreaById(id: number) {
    if (Number.isNaN(id) || id <= 0)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_GEOAREA_ID);
    const area = await this.geofenceareaDAO.get(id);
    if (!area) {
      throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND);
    }

    return area;
  };

  public async createArea(data: GeofenceareaCreationData) {
    // Se l'area con le stesse coordinate o lo stesso nome esiste già, lanciamo un errore.
    if (await this.findByCoords(data.area.coordinates) || await this.geofenceareaDAO.findByName(data.name)) {
      throw ErrorFactory.getError(AppErrorEnum.GEOAREA_ALREADY_EXISTS)
    }
    // La validazione dei dati già viene eseguito dal middleware.
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
  };

  public async getGeoareaByPosition(longitudine: number, latitudine: number) {
    const db = DatabaseConnection.getInstance();
    const results = await db.query(`SELECT ga.* FROM geofence_areas ga WHERE ST_Within(ST_SetSRID(ST_MakePoint(:longitudine, :latitudine), 4326), ga.area)`,
      {
        // Mappiamo il risultato al model Geofencearea, così otteniamo l'oggetto come risultato. Replacement sostituisce i parametri con i valori associati.
        replacements: { latitudine: latitudine, longitudine: longitudine },
        type: QueryTypes.SELECT,
        model: Geofencearea,
        mapToModel: true
      });
    // Per estrarre un solo oggetto, vediamo la lunghezza del risultato della query.
    // Se è > 0, prendiamo la prima geofencearea (può estrarre al massimo una sola geofencearea), altrimenti restituiamo null.
    return results.length > 0 ? results[0] : null;
  }
}