import { Transaction } from 'sequelize';
import { Imbarcazione, ImbarcazioneCreationData } from '../models/ImbarcazioneModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { Geofencearea } from '../models/GeofenceareaModel.js';
import { User } from '../models/UserModel.js';
import { GeofenceImbarcazioni } from '../models/GeofenceImbarcazioniModel.js';
import { UserImbarcazioni } from '../models/UserImbarcazioniModel.js';

//Qui ci si occupa solo dell'esecuzione delle query, è il layer che parla col db
interface IImbarcazioneDAO {
  create(data: ImbarcazioneCreationData, t: Transaction): Promise<Imbarcazione>;
  findById(mmsi: number): Promise<Imbarcazione | null>;
  findAll(): Promise<Imbarcazione[]>;
  update(mmsi: number, data: Partial<ImbarcazioneCreationData>, t: Transaction): Promise<Imbarcazione>;
  delete(mmsi: number, t: Transaction): Promise<number>;
  findAllGeofences(): Promise<Imbarcazione[]>;
  findAllWithUserWithGeofences(user_id: number): Promise<Imbarcazione[]>;
  linkGeoareas(mmsi: number, geoarea_ids: number[], t: Transaction): Promise<GeofenceImbarcazioni[]>;
  linkUser(mmsi: number, user_id: number, t: Transaction): Promise<UserImbarcazioni>;
  findUserAssociation(mmsi: number): Promise<UserImbarcazioni | null>;
  findGeoareaAssociation(mmsi: number, geoarea_id: number): Promise<GeofenceImbarcazioni | null>;
  deleteGeoareaAssociation(mmsi: number, geoarea_id: number, t: Transaction): Promise<number>;
}

export class ImbarcazioneDAO implements IImbarcazioneDAO {
  async create(data: ImbarcazioneCreationData, t: Transaction): Promise<Imbarcazione> {
    try {
      return await Imbarcazione.create(data, {transaction: t});
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
    }
  }

  async findById(mmsi: number): Promise<Imbarcazione | null> {
    try {
      return await Imbarcazione.findByPk(mmsi);
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  async findAll(): Promise<Imbarcazione[]> {
    try {
      return await Imbarcazione.findAll();
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  async findAllGeofences(): Promise<Imbarcazione[]> {
    try {
      return await Imbarcazione.findAll({
        include: [{
          model: Geofencearea,
          as: 'Geofenceareas', //Altrimenti dava problemi e non trovava il model (è un alias dichiarato nel model)
          attributes: ['geoarea_id', 'name'], //Specifica quali attributi mostrare
          through: { attributes: [] } //Così escludo gli attributi della tabella di collegamento
        }]
      });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  async findAllWithUserWithGeofences(user_id: number): Promise<Imbarcazione[]> {
    try {
      return await Imbarcazione.findAll({
        include: [
          {
            model: User,
            as: 'Proprietario',
            where: { user_id: user_id },
            attributes: [],
            through: { attributes: [] }
          },
          {
            model: Geofencearea,
            as: 'Geofenceareas',
            attributes: ['geoarea_id', 'name'],
            through: { attributes: [] }
          }
        ]
      });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  async linkGeoareas(mmsi: number, geoarea_ids: number[], t: Transaction): Promise<GeofenceImbarcazioni[]> {
    try {
      //bulkCreate è utile quando devo fare più insert contemporaneamente, come in questo caso. Uso map cosi ad ogni id associo l'oggetto { mmsi: mmsi, geoarea_id: geoarea_id } che bulkCreate inserirà nella tabella molti a molti di collegamento
      return await GeofenceImbarcazioni.bulkCreate(
        geoarea_ids.map(geoarea_id => ({ mmsi: mmsi, geoarea_id: geoarea_id })),
        { ignoreDuplicates: true, transaction: t }
      );
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
    }
  }

  async linkUser(mmsi: number, user_id: number, t: Transaction): Promise<UserImbarcazioni> {
    try {
      return await UserImbarcazioni.create({ user_id: user_id, mmsi: mmsi }, { transaction: t });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
    }
  }

  async findUserAssociation(mmsi: number): Promise<UserImbarcazioni | null> {
    try {
      return await UserImbarcazioni.findOne({ where: { mmsi: mmsi }});
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  async findGeoareaAssociation(mmsi: number, geoarea_id: number): Promise<GeofenceImbarcazioni | null> {
    try {
      return await GeofenceImbarcazioni.findOne({ where: { mmsi: mmsi, geoarea_id: geoarea_id }});
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  async deleteGeoareaAssociation(mmsi: number, geoarea_id: number, t: Transaction): Promise<number> {
    try {
      return await GeofenceImbarcazioni.destroy({ where: { mmsi: mmsi, geoarea_id: geoarea_id }, transaction: t });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
    }
  }

  async update(mmsi: number, data: Partial<ImbarcazioneCreationData>, t: Transaction): Promise<Imbarcazione> {
    try {
      const [, affectedRows] = await Imbarcazione.update(data, { where: { mmsi: mmsi }, transaction: t, returning: true });
      return affectedRows[0]!;
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.UPDATE_ERROR);
    }
  }

  async delete(mmsi: number, t: Transaction): Promise<number> {
    try {
      return await Imbarcazione.destroy({ where: { mmsi: mmsi }, transaction: t });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
    }
  }
}
