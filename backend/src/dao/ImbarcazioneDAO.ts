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
    return await Imbarcazione.create(data, {transaction: t});
  }

  async findById(mmsi: number): Promise<Imbarcazione | null> {
    return await Imbarcazione.findByPk(mmsi);
  }

  async findAll(): Promise<Imbarcazione[]> {
    return await Imbarcazione.findAll();
  }

  async findAllGeofences(): Promise<Imbarcazione[]> {
    return await Imbarcazione.findAll({
      include: [{
        model: Geofencearea,
        as: 'Geofenceareas', //Altrimenti dava problemi e non trovava il model (è un alias dichiarato nel model)
        attributes: ['geoarea_id', 'name'], //Specifica quali attributi mostrare
        through: { attributes: [] } //Così escludo gli attributi della tabella di collegamento
      }]
    });
  }

  async findAllWithUserWithGeofences(user_id: number): Promise<Imbarcazione[]> {
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
  }

  async linkGeoareas(mmsi: number, geoarea_ids: number[], t: Transaction): Promise<GeofenceImbarcazioni[]> {
    //bulkCreate è utile quando devo fare più insert contemporaneamente, come in questo caso. Uso map cosi ad ogni id associo l'oggetto { mmsi: mmsi, geoarea_id: geoarea_id } che bulkCreate inserirà nella tabella molti a molti di collegamento
    return await GeofenceImbarcazioni.bulkCreate(
      geoarea_ids.map(geoarea_id => ({ mmsi: mmsi, geoarea_id: geoarea_id })),
      { ignoreDuplicates: true, transaction: t }
    );
  }

  async linkUser(mmsi: number, user_id: number, t: Transaction): Promise<UserImbarcazioni> {
    return await UserImbarcazioni.create({ user_id: user_id, mmsi: mmsi }, { transaction: t });
  }

  async findUserAssociation(mmsi: number): Promise<UserImbarcazioni | null> {
    return await UserImbarcazioni.findOne({ where: { mmsi: mmsi }});
  }

  async findGeoareaAssociation(mmsi: number, geoarea_id: number): Promise<GeofenceImbarcazioni | null> {
    return await GeofenceImbarcazioni.findOne({ where: { mmsi: mmsi, geoarea_id: geoarea_id }});
  
  }

  async deleteGeoareaAssociation(mmsi: number, geoarea_id: number, t: Transaction): Promise<number> {
    return await GeofenceImbarcazioni.destroy({ where: { mmsi: mmsi, geoarea_id: geoarea_id }, transaction: t });
  }

  async update(mmsi: number, data: Partial<ImbarcazioneCreationData>, t: Transaction): Promise<Imbarcazione> {
    const [, affectedRows] = await Imbarcazione.update(data, { where: { mmsi: mmsi }, transaction: t, returning: true });
    return affectedRows[0]!;
  }

  async delete(mmsi: number, t: Transaction): Promise<number> {
    return await Imbarcazione.destroy({ where: { mmsi: mmsi }, transaction: t });
  }
}
