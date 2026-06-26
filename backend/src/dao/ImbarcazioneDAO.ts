import { QueryTypes, Transaction } from 'sequelize';
import { Imbarcazione, ImbarcazioneCreationData } from '../models/ImbarcazioneModel.js';
import { Geofencearea } from '../models/GeofenceareaModel.js';
import { User } from '../models/UserModel.js';
import { GeofenceImbarcazioni } from '../models/GeofenceImbarcazioniModel.js';
import { Segnalazione } from '../models/SegnalazioneModel.js';
import { LogSpostamenti } from '../models/LogSpostamentiModel.js';
import { DatabaseConnection } from '../singleton/DBConnection.js';
import { Datiinviati } from '../models/DatiInviatiModel.js';
import { FeatureCollection } from 'geojson';
import { ImbarcazioniSegnalazioni } from '../models/ImbarcazioniSegnalazioniModel.js';

//Qui ci si occupa solo dell'esecuzione delle query, è il layer che parla col db
interface IImbarcazioneDAO {
  create(data: ImbarcazioneCreationData, t: Transaction): Promise<Imbarcazione>;
  findById(mmsi: number): Promise<Imbarcazione | null>;
  findByUserId(user_id: number): Promise<Imbarcazione | null>;
  findAll(): Promise<Imbarcazione[]>;
  findAllWithSegnalazioni(): Promise<Imbarcazione[]>;
  findAllByUserId(user_id: number): Promise<Imbarcazione[]>;
  update(mmsi: number, data: Partial<ImbarcazioneCreationData>, t: Transaction): Promise<Imbarcazione>;
  delete(mmsi: number, t: Transaction): Promise<number>;
  findAllGeofences(): Promise<Imbarcazione[]>;
  findAllWithUserWithGeofences(user_id: number): Promise<Imbarcazione[]>;
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

  async findAllLastSpostamento(): Promise<Imbarcazione[]> {
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

  async getGeofenceAreasGeoJson(mmsi: number, start_date: Date, end_date: Date): Promise<FeatureCollection> {
  const db = DatabaseConnection.getInstance();
  const startEpoch = start_date.getTime();
  const endEpoch = end_date.getTime();

  const [row] = await db.query<{ geojson: FeatureCollection }>(
      `SELECT json_build_object(
          'type', 'FeatureCollection',
          'features', COALESCE(
            json_agg(
              json_build_object(
                'type', 'Feature',
                'geometry', json_build_object(
                  'type', 'Point',
                  'coordinates', ARRAY[d.longitudine, d.latitudine]
                )
              )
            ),
            '[]'::json
          )
        ) AS geojson
        FROM dati_inviati d
        WHERE d.mmsi = :mmsi
          AND d."timestamp" BETWEEN :startEpoch AND :endEpoch;
      `,
      {
        replacements: {
          mmsi,
          startEpoch,
          endEpoch
        },
        type: QueryTypes.SELECT
      }
    );
    return row!.geojson;
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

  async findAllWithSegnalazioni(): Promise<Imbarcazione[]> {
      return await Imbarcazione.findAll({
          attributes: ['mmsi', 'name'],
          include: [
              {
                  model: Segnalazione,
                  as: 'Segnalazioni',
                  attributes: ['stato'],
                  through: {
                      attributes: []
                  },
                  required: true
              }
          ]
      });
  }

  async update(mmsi: number, data: Partial<ImbarcazioneCreationData>, t: Transaction): Promise<Imbarcazione> {
    const [, affectedRows] = await Imbarcazione.update(data, { where: { mmsi: mmsi }, transaction: t, returning: true });
    return affectedRows[0]!;
  }

  async delete(mmsi: number, t: Transaction): Promise<number> {
    return await Imbarcazione.destroy({ where: { mmsi: mmsi }, transaction: t });
  }
}