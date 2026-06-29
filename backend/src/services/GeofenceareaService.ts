import { GeofenceareaDAO } from "../dao/GeofenceareaDAO.js";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import { DatabaseConnection } from "../singleton/DBConnection.js";
import { Geofencearea, GeofenceareaCreationData } from "../models/GeofenceareaModel.js";
import { Position } from "geojson";
import { QueryTypes } from "sequelize";
import { AppError } from "../models/AppErrorModel.js";
import { DatiinviatiDAO } from "../dao/DatiInviatiDAO.js";
import { ImbarcazioneDAO } from "../dao/ImbarcazioneDAO.js";

export class GeofenceareaService {
  private readonly geofenceareaDAO = new GeofenceareaDAO();
  private readonly datiinviatiDAO = new DatiinviatiDAO();
  private readonly imbarcazioneDAO = new ImbarcazioneDAO();


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

  //FUNZIONE DELLA ROTTA ADMIN CHE TORNA LO STATUS DI UN IMBARCAZIONE PER UNA DETERMINATA GEOAREA (SE geo_id_body = last_dato_geo_id -> 'DENTRO', ANCHE LA PERMANENZA)
  public async getGeoareaByLastDatoImbarcazione(mmsi: number, geoarea_id: number) {

    if (Number.isNaN(mmsi) || mmsi <= 0)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI)

    if (Number.isNaN(geoarea_id) || geoarea_id <= 0)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_GEOAREA_ID)

    //Prendo l'imbarcazione
    const imbarcazione = await this.imbarcazioneDAO.get(mmsi);

    if (!imbarcazione)
      throw ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND)

    //Prendo l'id della geoarea inserita nel body
    const geoarea_body = await this.geofenceareaDAO.get(geoarea_id);

    if (!geoarea_body)
      throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND)

    //Trovo l'ultimo dato inviato per l'imbarcazione
    const last_dato = await this.datiinviatiDAO.getLastDatoByMmsi(mmsi);
    if (!last_dato)
      throw ErrorFactory.getError(AppErrorEnum.DATO_NOT_FOUND)

    //Trovo la geoarea associata a latitudine e longitudine dell'ultimo dato
    const geoarea_last_dato = await this.getGeoareaByPosition(last_dato.longitudine, last_dato.latitudine);

    if (!geoarea_last_dato)
      throw ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND)

    const diff = Date.now() - last_dato.created_at;
    const giorni = Math.floor(diff / 86400000);
    const ore = Math.floor((diff % 86400000) / 3600000);
    const minuti = Math.floor((diff % 3600000) / 60000);

    // console.log("last dato", geoarea_last_dato.geoarea_id)
    // console.log("body", geoarea_body.geoarea_id)

    // Se la geoarea associata all'ultimo dato inviato per quell'mmsi, corrisponde a quello inserito nel body, vuol dire che siamo dentro l'ultima geoarea associata, altrimenti siamo fuori
    if (geoarea_last_dato.geoarea_id === geoarea_body.geoarea_id) {
      return {
        mmsi: imbarcazione.mmsi,
        name: imbarcazione.name,
        stato: 'DENTRO',
        permanenza: `${giorni}g ${ore}h ${minuti}m`
      }
    } else {
      return {
        mmsi: imbarcazione.mmsi,
        name: imbarcazione.name,
        stato: 'FUORI'
      }
    }
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

  public async updateArea(id: number, data: Partial<GeofenceareaCreationData>) {
    if (!data || Object.keys(data).length === 0) {
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }
    await this.getAreaById(id); // controlla esistenza e validità id
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      await this.geofenceareaDAO.update(id, data, t);
      await t.commit();
      return await this.geofenceareaDAO.get(id);
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError)
        throw err;
      throw ErrorFactory.getError(AppErrorEnum.UPDATE_ERROR);
    }
  };

  public async deleteArea(id: number) {
    await this.getAreaById(id); // controlla esistenza e validità id
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      const result = await this.geofenceareaDAO.delete(id, t);
      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError)
        throw err;
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
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
    return results.length > 0 ? results[0]! : null;
  }
}