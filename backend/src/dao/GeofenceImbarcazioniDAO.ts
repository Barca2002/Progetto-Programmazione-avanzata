import { Transaction } from 'sequelize';
import { GeofenceImbarcazioni } from '../models/GeofenceImbarcazioniModel.js';

// Interfaccia del DAO per l'associazione Geofence-Imbarcazione
interface IGeofenceImbarcazioniDAO {
  create(geoarea_id: number, mmsi: number, t: Transaction): Promise<GeofenceImbarcazioni>;
  findAssociation(geoarea_id: number, mmsi: number, t: Transaction): Promise<GeofenceImbarcazioni | null>;
  findIsInMmsi(mmsi: number): Promise<GeofenceImbarcazioni | null>;
  findAllByMmsi(mmsi: number): Promise<GeofenceImbarcazioni[]>;
  delete(geoarea_id: number, mmsi: number, t: Transaction): Promise<number>;
}

export class GeofenceImbarcazioniDAO implements IGeofenceImbarcazioniDAO {
  async create(geoarea_id: number, mmsi: number, t: Transaction): Promise<GeofenceImbarcazioni> {
      return await GeofenceImbarcazioni.create({ geoarea_id, mmsi }, {transaction:t});
  }

  // Funzione per trovare l'associazione tra la geoarea e l'imbarcazione. Bisogna passare anche la transazione perché lavoriamo con operazioni sospese e bisogna controllare anche in esse.
  async findAssociation(geoarea_id: number, mmsi: number, t: Transaction): Promise<GeofenceImbarcazioni | null> {
      return await GeofenceImbarcazioni.findOne({
        where: { geoarea_id, mmsi }, transaction: t
      });
  }

  async findIsInMmsi(mmsi: number): Promise<GeofenceImbarcazioni | null>{
    return await GeofenceImbarcazioni.findOne({
      where: {mmsi, is_in: true}
    })
  }

  async findAllByMmsi(mmsi: number): Promise<GeofenceImbarcazioni[]> {
    return await GeofenceImbarcazioni.findAll({
      where: { mmsi }
    });
  }
  
  async delete(geoarea_id: number, mmsi: number, t: Transaction): Promise<number> {
    return await GeofenceImbarcazioni.destroy({
      where: { geoarea_id, mmsi },
      transaction: t
    });
  }

}
