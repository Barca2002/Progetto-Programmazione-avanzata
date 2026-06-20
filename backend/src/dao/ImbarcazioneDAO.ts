import { Imbarcazione, ImbarcazioneCreationData } from '../models/ImbarcazioneModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { Geofencearea } from '../models/GeofenceareaModel.js';
import { User } from '../models/UserModel.js';

interface IImbarcazioneDAO {
  create(data: ImbarcazioneCreationData): Promise<Imbarcazione>;
  findById(mmsi: number): Promise<Imbarcazione | null>;
  findAll(): Promise<Imbarcazione[]>;
  update(mmsi: number, data: Partial<ImbarcazioneCreationData>): Promise<number>;
  delete(mmsi: number): Promise<number>;
  findAllGeofences(): Promise<Imbarcazione[]>;
  findAllByUserWithGeofences(user_id: number): Promise<Imbarcazione[]>;
}

export class ImbarcazioneDAO implements IImbarcazioneDAO {
  async create(data: ImbarcazioneCreationData): Promise<Imbarcazione> {
    try {
      let imbarcazione = await Imbarcazione.create(data);
      return imbarcazione;
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }
  }

  async findById(mmsi: number): Promise<Imbarcazione | null> {
    try {
      return await Imbarcazione.findByPk(mmsi);
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  // IMBARCAZIONI CON GEOFENCEAREAS ASSOCIATE (X ROTTA ADMIN)
  async findAllGeofences(): Promise<Imbarcazione[]> {
    try {
      return await Imbarcazione.findAll({
        include: [{
          model: Geofencearea,
          attributes: ['geoarea_id', 'name'], //quali colonne restituire di geofence areas
          through: { attributes: [] } //esclude attributi della molti a molti fra i due models (mmsi e geoarea_id)
        }]
      });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  // IMBARCAZIONI DELL'UTENTE LOGGATO CON GEOFENCEAREAS ASSOCIATE
  async findAllByUserWithGeofences(user_id: number): Promise<Imbarcazione[]> {
    try {
        return await Imbarcazione.findAll({
            include: [
                {
                    model: User,
                    where: { user_id }, //voglio le imbarcazioni con le geofence areas associate allo user_id loggato
                    attributes: [],
                    through: { attributes: [] }
                },
                {
                    model: Geofencearea,
                    attributes: ['geoarea_id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });
    } catch (err) {
        throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async findAll(): Promise<Imbarcazione[]> {
    try {
      return await Imbarcazione.findAll();
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async update(mmsi: number, data: Partial<ImbarcazioneCreationData>): Promise<number> {
    try {
      const [affectedCount] = await Imbarcazione.update(data, { where: { mmsi } });
      return affectedCount;
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async delete(mmsi: number): Promise<number> {
    try {
      return await Imbarcazione.destroy({ where: { mmsi } });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }
}

export default ImbarcazioneDAO;