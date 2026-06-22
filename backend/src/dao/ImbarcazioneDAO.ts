import { Transaction } from 'sequelize';
import { Imbarcazione, ImbarcazioneCreationData } from '../models/ImbarcazioneModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { Geofencearea } from '../models/GeofenceareaModel.js';
import { User } from '../models/UserModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { GeofenceImbarcazioni } from '../models/GeofenceImbarcazioniModel.js';

//Qui ci si occupa solo dell'esecuzione delle query, è il layer che parla col db
interface IImbarcazioneDAO {
  create(data: ImbarcazioneCreationData, t: Transaction): Promise<Imbarcazione>;
  findById(mmsi: number): Promise<Imbarcazione | null>;
  findAll(): Promise<Imbarcazione[]>;
  update(mmsi: number, data: Partial<ImbarcazioneCreationData>): Promise<number>;
  delete(mmsi: number): Promise<number>;
  findAllGeofences(): Promise<Imbarcazione[]>;
  findAllWithUserWithGeofences(user_id: number): Promise<Imbarcazione[]>;
  linkGeoareas(mmsi: number, geoarea_ids: number[], t: Transaction): Promise<void>;
  linkUser(mmsi: number, user_id: number, t: Transaction): Promise<void>;
  findUserAssociation(mmsi: number, t: Transaction): Promise<unknown>;
  findGeoareaAssociation(mmsi: number, geoarea_id: number, t: Transaction): Promise<unknown>;
  deleteGeoareaAssociation(mmsi: number, geoarea_id: number, t: Transaction): Promise<void>;
}

export class ImbarcazioneDAO implements IImbarcazioneDAO {

  async create(data: ImbarcazioneCreationData, t: Transaction): Promise<Imbarcazione> {
    try {
      return await Imbarcazione.create(data, {transaction: t});
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

  async findAll(): Promise<Imbarcazione[]> {
    try {
      return await Imbarcazione.findAll();
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
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
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async findAllWithUserWithGeofences(user_id: number): Promise<Imbarcazione[]> {
    try {
      return await Imbarcazione.findAll({
        include: [
          {
            model: User,
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
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async linkGeoareas(mmsi: number, geoarea_ids: number[], t: Transaction): Promise<void> {
    try {
      //bulkCreate è utile quando devo fare più insert contemporaneamente, come in questo caso. Uso map cosi ad ogni id associo l'oggetto { mmsi: mmsi, geoarea_id: geoarea_id } che bulkCreate inserirà nella tabella molti a molti di collegamento
      await GeofenceImbarcazioni.bulkCreate(
        geoarea_ids.map(geoarea_id => ({ mmsi: mmsi, geoarea_id: geoarea_id })),
        { ignoreDuplicates: true, transaction: t }
      );
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async linkUser(mmsi: number, user_id: number, t: Transaction): Promise<void> {
    try {
      const db = DatabaseConnection.getInstance();
      //user_imbarcazioni è un model che viene creato a runtime (quando lancio inizializzaAssociazioni(), grazie all'opzione through: 'user_imbarcazioni'), in questo modo mi ci connetto per eseguire query su di lui
      const UserImbarcazioni = db.models.user_imbarcazioni!;
      await UserImbarcazioni.create({ user_id: user_id, mmsi: mmsi }, { transaction: t });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async findUserAssociation(mmsi: number, t: Transaction) {
    try {
      const db = DatabaseConnection.getInstance();
      const UserImbarcazioni = db.models.user_imbarcazioni!;
      return await UserImbarcazioni.findOne({ where: { mmsi: mmsi }, transaction: t });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async findGeoareaAssociation(mmsi: number, geoarea_id: number, t: Transaction) {
    try {
      return await GeofenceImbarcazioni.findOne({ where: { mmsi: mmsi, geoarea_id: geoarea_id }, transaction: t });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async deleteGeoareaAssociation(mmsi: number, geoarea_id: number, t: Transaction): Promise<void> {
    try {
      await GeofenceImbarcazioni.destroy({ where: { mmsi: mmsi, geoarea_id: geoarea_id }, transaction: t });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async update(mmsi: number, data: Partial<ImbarcazioneCreationData>): Promise<number> {
    try {
      const [affectedCount] = await Imbarcazione.update(data, { where: { mmsi: mmsi } });
      return affectedCount;
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async delete(mmsi: number): Promise<number> {
    try {
      return await Imbarcazione.destroy({ where: { mmsi: mmsi } });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }
}
