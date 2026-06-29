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
  public async getAllImbarcazioniStatus(geoarea_id: number) {

    const imbarcazioni = await this.imbarcazioneDAO.getAll();
    const results = [];
    if (Number.isNaN(geoarea_id) || geoarea_id <= 0)
      throw ErrorFactory.getError(AppErrorEnum.INVALID_GEOAREA_ID)

    //UGUALE A MYIMBARCAZIONISTATUS IN IMBARCAZIONISERVICE OTTIMIZZARE!!!
    for (const imbarcazione of imbarcazioni) {
      //Prendi l'ultimo dato inviato, associato all'imbarcazione
      const last_dato = await this.datiinviatiDAO.getLastDatoByMmsi(imbarcazione.mmsi);
      if (!last_dato) {
        results.push({ mmsi: imbarcazione.mmsi, name: imbarcazione.name, stato: 'FUORI' });
        continue; //Se non c'è continuo comunque dicendo che è fuori
      }

      //Prendo la geoarea associata all'ultimo dato
      const geoarea_last_dato = await this.getGeoareaByPosition(last_dato.longitudine, last_dato.latitudine);

      // Siccome l'utente può inviare posizioni anche che non siano di geoaree, dico comunque che è fuori
      if(!geoarea_last_dato){
        results.push({ mmsi: imbarcazione.mmsi, name: imbarcazione.name, stato: 'FUORI' });
        continue; //Se non c'è continuo comunque dicendo che è fuori
      }
     
      //Se l'id della geoarea associato all'ultimo invio di dati per quell'imbarcazione è uguale a quello inserito nel body, vuol dire che è dentro quella geoarea
      if (geoarea_last_dato.geoarea_id === geoarea_id) {
        const diff = Date.now() - last_dato.created_at;
        const giorni = Math.floor(diff / 86400000);
        const ore = Math.floor((diff % 86400000) / 3600000);
        const minuti = Math.floor((diff % 3600000) / 60000);
        results.push({ mmsi: imbarcazione.mmsi, name: imbarcazione.name, stato: 'DENTRO', permanenza: `${giorni}g ${ore}h ${minuti}m` });
      } else {
        results.push({ mmsi: imbarcazione.mmsi, name: imbarcazione.name, stato: 'FUORI' });
      }
    }

    return results;
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