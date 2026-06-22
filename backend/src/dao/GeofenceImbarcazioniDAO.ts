import { Transaction } from 'sequelize';
import { GeofenceImbarcazioni } from '../models/GeofenceImbarcazioniModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';

// Interfaccia del DAO per l'associazione Geofence-Imbarcazione
interface IGeofenceImbarcazioniDAO {
  create(geoarea_id: number, mmsi: number, t: Transaction): Promise<GeofenceImbarcazioni>;
  findAssociation(geoarea_id: number, mmsi: number, t?: Transaction): Promise<GeofenceImbarcazioni | null>;
  findAllByMmsi(mmsi: number, t?: Transaction): Promise<GeofenceImbarcazioni[]>;
  updateLocation(mmsi: number, geoarea_id: number, t: Transaction): Promise<number>;
  resetLocation(mmsi: number, t: Transaction): Promise<number>;
  delete(geoarea_id: number, mmsi: number, t?: Transaction): Promise<number>;
}

export class GeofenceImbarcazioniDAO implements IGeofenceImbarcazioniDAO {

  async create(geoarea_id: number, mmsi: number, t: Transaction): Promise<GeofenceImbarcazioni> {
    try {
        return await GeofenceImbarcazioni.create({ geoarea_id, mmsi }, {transaction:t});
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }
  }

  // Funzione per trovare l'associazione tra la geoarea e l'imbarcazione
  async findAssociation(geoarea_id: number, mmsi: number, t?: Transaction): Promise<GeofenceImbarcazioni | null> {
    try {
      return await GeofenceImbarcazioni.findOne({
        where: { geoarea_id, mmsi },
        ...(t && { transaction: t })
      });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async findAllByMmsi(mmsi: number, t?: Transaction): Promise<GeofenceImbarcazioni[]> {
    try {
      return await GeofenceImbarcazioni.findAll({
        where: { mmsi },
        ...(t && { transaction: t })
      });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  /**
   * Aggiorna la posizione di un'imbarcazione impostando lo stato 'is_in' per una specifica barca dentro una specifica geofence.
   */
  async updateLocation(mmsi: number, geoarea_id: number, t: Transaction): Promise<number> {
    try {
      const [affectedCount] = await GeofenceImbarcazioni.update(
        { is_in: true },
        { 
          where: { mmsi, geoarea_id }, 
          transaction: t 
        }
      );
      return affectedCount;
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  /**
   * Resetta lo stato 'is_in' a false per tutte le geofence associate a una determinata imbarcazione
   */
  async resetLocation(mmsi: number, t: Transaction): Promise<number> {
    try {
      const [affectedCount] = await GeofenceImbarcazioni.update(
        { is_in: false },
        { 
          where: { mmsi }, 
          transaction: t 
        }
      );
      return affectedCount;
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async delete(geoarea_id: number, mmsi: number, t?: Transaction): Promise<number> {
    try {
      return await GeofenceImbarcazioni.destroy({
        where: { geoarea_id, mmsi },
        ...(t && { transaction: t })
      });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }
}
