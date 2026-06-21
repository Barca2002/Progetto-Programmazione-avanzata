import { Datiinviati } from '../models/DatiInviatiModel.js';
import { DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { QueryTypes, Sequelize, Transaction } from 'sequelize';

interface IDatiinviatiDAO {
  create(data: DatiinviatiCreationData, t?: Transaction): Promise<Datiinviati>;
  findByMmsi(mmsi: number): Promise<Datiinviati[]>;
  checkLocationInGeoarea(db: Sequelize, mmsi: number, latitudine: number, longitudine: number): Promise<{ geoarea_id: number }[]>
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

  async checkLocationInGeoarea(db: Sequelize, mmsi: number, latitudine: number, longitudine: number): Promise<{ geoarea_id: number }[]> {
    try {
        return await db.query(`SELECT ga.geoarea_id FROM geofence_areas ga INNER JOIN geofence_imbarcazioni gi ON ga.geoarea_id = gi.geoarea_id WHERE gi.mmsi = :mmsi AND ST_Within(ST_SetSRID(ST_MakePoint(:longitudine, :latitudine), 4326), ga.area)`, 
        {
            replacements: { mmsi: mmsi, latitudine: latitudine, longitudine: longitudine },
            type: QueryTypes.SELECT
        }) as unknown as { geoarea_id: number }[];
    } catch (err) {
        throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
}
}

export default DatiinviatiDAO;