import { Datiinviati } from '../models/DatiInviatiModel.js';
import { DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { QueryTypes, Sequelize, Transaction } from 'sequelize';
import { Geofencearea } from '../models/GeofenceareaModel.js';

interface IDatiinviatiDAO {
  create(data: DatiinviatiCreationData, t: Transaction): Promise<Datiinviati>;
  findAllByMmsi(mmsi: number): Promise<Datiinviati[]>;
  checkLocationInGeoarea(db: Sequelize, mmsi: number, latitudine: number, longitudine: number): Promise<Geofencearea | null>
}

export class DatiinviatiDAO implements IDatiinviatiDAO {

  async create(data: DatiinviatiCreationData, t: Transaction): Promise<Datiinviati> {
    try {
        return await Datiinviati.create({
          mmsi: data.mmsi,
          latitudine: data.latitudine,
          longitudine: data.longitudine,
          velocita_kmh: data.velocita_kmh,
          stato: data.stato,
          timestamp: Date.now()
        }, { transaction: t });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
    }
  }

  async findAllByMmsi(mmsi: number): Promise<Datiinviati[]> {
    try {
      return await Datiinviati.findAll({ where: { mmsi: mmsi } });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  // Estrae la geofence area di un'imbarcazione in base alla sua posizione
  async checkLocationInGeoarea(db: Sequelize, mmsi: number, latitudine: number, longitudine: number): Promise<Geofencearea | null> {
    try {
        const results = await db.query(`SELECT ga.* FROM geofence_areas ga INNER JOIN geofence_imbarcazioni gi ON ga.geoarea_id = gi.geoarea_id WHERE gi.mmsi = :mmsi AND ST_Within(ST_SetSRID(ST_MakePoint(:longitudine, :latitudine), 4326), ga.area)`, 
        {
          // Mappiamo il risultato al model Geofencearea, così otteniamo l'oggetto come risultato. Replacement sostituisce i parametri con i valori associati.
            replacements: { mmsi: mmsi, latitudine: latitudine, longitudine: longitudine },
            type: QueryTypes.SELECT,
            model: Geofencearea,
            mapToModel: true
        });
        // Per estrarre un solo oggetto, vediamo la lunghezza del risultato della query.
        // Se è > 0, prendiamo la prima geofencearea (può estrarre al massimo una sola geofencearea), altrimenti restituiamo null.
        return results.length > 0 ? results[0]! : null;
    } catch (err) {
        throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  //Funzione che in base ai dati inseriti, controlla se la velocità inserita supera quella massima consentita, se presente
  async checkVelocity(geoarea: Geofencearea, velocity: number): Promise<boolean> {
    try {      
      if (geoarea.max_speed === null)
        return true; // non è in nessuna geoarea o non ha limite, velocità ok

      return velocity <= geoarea.max_speed;
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }
}
