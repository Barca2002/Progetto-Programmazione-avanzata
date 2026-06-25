import { col, fn, Op, QueryTypes, Transaction } from 'sequelize';
import { Imbarcazione, ImbarcazioneCreationData } from '../models/ImbarcazioneModel.js';
import { Geofencearea } from '../models/GeofenceareaModel.js';
import { User } from '../models/UserModel.js';
import { GeofenceImbarcazioni } from '../models/GeofenceImbarcazioniModel.js';
import { Segnalazione } from '../models/SegnalazioneModel.js';
import { LogSpostamenti } from '../models/LogSpostamentiModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import sequelize from 'sequelize/lib/sequelize';

//Qui ci si occupa solo dell'esecuzione delle query, è il layer che parla col db
interface IImbarcazioneDAO {
  create(data: ImbarcazioneCreationData, t: Transaction): Promise<Imbarcazione>;
  findById(mmsi: number): Promise<Imbarcazione | null>;
  findByUserId(user_id: number): Promise<Imbarcazione | null>;
  findAll(): Promise<Imbarcazione[]>;
  findAllByUserId(user_id: number): Promise<Imbarcazione[]>;
  update(mmsi: number, data: Partial<ImbarcazioneCreationData>, t: Transaction): Promise<Imbarcazione>;
  delete(mmsi: number, t: Transaction): Promise<number>;
  findAllGeofences(): Promise<Imbarcazione[]>;
  findAllWithUserWithGeofences(user_id: number): Promise<Imbarcazione[]>;
  linkGeoareas(mmsi: number, geoarea_ids: number[], t: Transaction): Promise<GeofenceImbarcazioni[]>;
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

  async findByUserId(user_id: number): Promise<Imbarcazione | null> {
    return await Imbarcazione.findOne({
      where: { user_id: user_id }
    });
  }

  async findAllByUserId(user_id: number): Promise<Imbarcazione[]> {
    return await Imbarcazione.findAll({
      where: { user_id: user_id }
    });
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

  async findAllWithSegnalazioni(): Promise<Imbarcazione[]> {
    return await Imbarcazione.findAll({
      include: [{
        model: Segnalazione,
        as: 'Segnalazioni',
        attributes: ['geoarea_id', 'stato'], 
      }]
    });
  }

  //Prendo per ogni coppia (mmsi, geoarea) l'ultimo spostamento fatto

  /*
  [
    {
        "mmsi": 247123456,
        "name": "Adriatica Uno",
        "Spostamenti": [
            { "geoarea_id": 1, "spostamento": "ENTRATA", "created_at": "2026-06-22 06:10:00" },
            { "geoarea_id": 7, "spostamento": "USCITA",  "created_at": "2026-06-20 18:30:00" }
        ]
    },
    {
        "mmsi": 247234567,
        "name": "Conero Explorer",
        "Spostamenti": [
            { "geoarea_id": 2, "spostamento": "ENTRATA", "created_at": "2026-06-22 07:45:00" }
        ]
    },
    {
        "mmsi": 247345678,
        "name": "San Ciriaco",
        "Spostamenti": []
    }
  ]
  */

  async findLastSpostamento(): Promise<Imbarcazione[]> {
    const db = DatabaseConnection.getInstance();
    return await Imbarcazione.findAll({
        include: [{
            model: LogSpostamenti,
            as: 'Spostamenti',
            attributes: ['geoarea_id', 'spostamento', 'created_at'],
            where: db.literal(`"Spostamenti"."created_at" = (
                SELECT MAX(ls.created_at) FROM log_spostamenti ls
                WHERE ls.mmsi = "Spostamenti"."mmsi"
                AND ls.geoarea_id = "Spostamenti"."geoarea_id"
            )`),
        }]
    });
  }

  async findAllWithUserWithGeofences(user_id: number): Promise<Imbarcazione[]> {
    return await Imbarcazione.findAll({
      // Filtriamo le imbarcazioni che appartengono a questo utente
      where: { user_id: user_id }, 
      include: [
        {
          model: User,
          as: 'Proprietario', // Alias al singolare definito nel file delle associazioni
          attributes: []
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