import { Datiinviati } from '../models/DatiInviatiModel.js';
import { DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { QueryTypes, Sequelize, Transaction } from 'sequelize';
import { Geofencearea } from '../models/GeofenceareaModel.js';

interface IDatiinviatiDAO {
  create(data: DatiinviatiCreationData, t?: Transaction): Promise<Datiinviati>;
  findByMmsi(mmsi: number): Promise<Datiinviati[]>;
  checkLocationInGeoarea(db: Sequelize, mmsi: number, latitudine: number, longitudine: number): Promise<Geofencearea | null>
}

export class DatiinviatiDAO implements IDatiinviatiDAO {

  async create(data: DatiinviatiCreationData, t?: Transaction): Promise<Datiinviati> {
    try {
      if (t) {
        return await Datiinviati.create({
          mmsi: data.mmsi,
          latitudine: data.latitudine,
          longitudine: data.longitudine,
          velocita_kmh: data.velocita_kmh,
          stato: data.stato,
          timestamp: Date.now()
        }, { transaction: t });
      }
      return await Datiinviati.create({
        mmsi: data.mmsi,
        latitudine: data.latitudine,
        longitudine: data.longitudine,
        velocita_kmh: data.velocita_kmh,
        stato: data.stato,
        timestamp: Date.now()
      });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }
  }

  async findByMmsi(mmsi: number): Promise<Datiinviati[]> {
    try {
      return await Datiinviati.findAll({ where: { mmsi: mmsi } });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  // Estrae la geofence area di un'imbarcazione in base alla sua posizione
  async checkLocationInGeoarea(db: Sequelize, mmsi: number, latitudine: number, longitudine: number): Promise<Geofencearea | null> {
    try {
        const results = await db.query(`SELECT ga.* FROM geofence_areas ga INNER JOIN geofence_imbarcazioni gi ON ga.geoarea_id = gi.geoarea_id WHERE gi.mmsi = :mmsi AND ST_Within(ST_SetSRID(ST_MakePoint(:longitudine, :latitudine), 4326), ga.area)`, 
        {
            replacements: { mmsi: mmsi, latitudine: latitudine, longitudine: longitudine },
            type: QueryTypes.SELECT,
            model: Geofencearea,
            mapToModel: true
        });
        // Per estrarre un solo oggetto, vediamo la lunghezza del risultato della query.
        // Se è > 0, prendiamo la prima geofencearea, altrimenti restituiamo null.
        return results.length > 0 ? results[0]! : null;
    } catch (err) {
        throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }
}
