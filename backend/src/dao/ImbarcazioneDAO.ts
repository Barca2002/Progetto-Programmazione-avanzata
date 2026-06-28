import { Transaction } from 'sequelize';
import { Imbarcazione, ImbarcazioneCreationData } from '../models/ImbarcazioneModel.js';
import { InterfacciaDAO } from './InterfacciaDAO.js';

/*
export interface InterfacciaDAO<T>{
    create(item: T, t: Transaction): Promise<T>;
    get(item_id1: number, item_id2?: number): Promise<T | null>;
    getAll(): Promise<T[]>; 
    update(item_id: number, item_id2?: number, new_data?: Partial<T>, t?: Transaction): Promise<T | null>;
    delete(item_id1: number, item_id2?: number, t?: Transaction): Promise<T | null>;
}
*/

export class ImbarcazioneDAO implements InterfacciaDAO<Imbarcazione> {
  async create(data: ImbarcazioneCreationData, t: Transaction): Promise<Imbarcazione> {
    return await Imbarcazione.create(data, {transaction: t});
  }

  async get(mmsi: number): Promise<Imbarcazione | null> {
    return await Imbarcazione.findByPk(mmsi);
  }

  async getAll(): Promise<Imbarcazione[]> {
    return await Imbarcazione.findAll();
  }

  async getByUserId(user_id: number): Promise<Imbarcazione | null> {
    return await Imbarcazione.findOne({
      where: { user_id: user_id }
    });
  }

  async findAllByUserId(user_id: number): Promise<Imbarcazione[]> {
    return await Imbarcazione.findAll({
      where: { user_id: user_id }
    });
  }

  // async findAllGeofences(): Promise<Imbarcazione[]> {
  //   return await Imbarcazione.findAll({
  //     include: [{
  //       model: Geofencearea,
  //       as: 'Geofenceareas', //Altrimenti dava problemi e non trovava il model (è un alias dichiarato nel model)
  //       attributes: ['geoarea_id', 'name'], //Specifica quali attributi mostrare
  //       through: { attributes: [] } //Così escludo gli attributi della tabella di collegamento
  //     }]
  //   });
  // }

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

  // async findAllLastSpostamento(): Promise<Imbarcazione[]> {
  //   const db = DatabaseConnection.getInstance();
  //   return await Imbarcazione.findAll({
  //       include: [{
  //           model: LogSpostamenti,
  //           as: 'Spostamenti',
  //           attributes: ['geoarea_id', 'spostamento', 'created_at'],
  //           where: db.literal(`"Spostamenti"."created_at" = (
  //               SELECT MAX(ls.created_at) FROM log_spostamenti ls
  //               WHERE ls.mmsi = "Spostamenti"."mmsi"
  //               AND ls.geoarea_id = "Spostamenti"."geoarea_id"
  //           )`),
  //       }]
  //   });
  // }

  // async getGeofenceAreasGeoJson(mmsi: number, start_date: Date, end_date: Date): Promise<FeatureCollection> {
  // const db = DatabaseConnection.getInstance();
  // const startEpoch = start_date.getTime();
  // const endEpoch = end_date.getTime();

  // const [row] = await db.query<{ geojson: FeatureCollection }>(
  //     `SELECT json_build_object(
  //         'type', 'FeatureCollection',
  //         'features', COALESCE(
  //           json_agg(
  //             json_build_object(
  //               'type', 'Feature',
  //               'geometry', json_build_object(
  //                 'type', 'Point',
  //                 'coordinates', ARRAY[d.longitudine, d.latitudine]
  //               )
  //             )
  //           ),
  //           '[]'::json
  //         )
  //       ) AS geojson
  //       FROM dati_inviati d
  //       WHERE d.mmsi = :mmsi
  //         AND d."timestamp" BETWEEN :startEpoch AND :endEpoch;
  //     `,
  //     {
  //       replacements: {
  //         mmsi,
  //         startEpoch,
  //         endEpoch
  //       },
  //       type: QueryTypes.SELECT
  //     }
  //   );
  //   return row!.geojson;
  // }

  // async findAllWithUserWithGeofences(user_id: number): Promise<Imbarcazione[]> {
  //   return await Imbarcazione.findAll({
  //     // Filtriamo le imbarcazioni che appartengono a questo utente
  //     where: { user_id: user_id }, 
  //     include: [
  //       {
  //         model: User,
  //         as: 'Proprietario', // Alias al singolare definito nel file delle associazioni
  //         attributes: []
  //       },
  //       {
  //         model: Geofencearea,
  //         as: 'Geofenceareas',
  //         attributes: ['geoarea_id', 'name'],
  //         through: { attributes: [] }
  //       }
  //     ]
  //   });
  // }

  // async findAllWithSegnalazioni(): Promise<Imbarcazione[]> {
  //     return await Imbarcazione.findAll({
  //         attributes: ['mmsi', 'name'],
  //         include: [
  //             {
  //                 model: Segnalazione,
  //                 as: 'Segnalazioni',
  //                 attributes: ['id', 'stato', 'created_at'],
  //                 through: {
  //                     attributes: []
  //                 },
  //                 required: true
  //             }
  //         ]
  //     });
  // }

  async update(mmsi: number, _item_id2?: number, new_data?: Partial<ImbarcazioneCreationData>, t?: Transaction): Promise<Imbarcazione | null> {
    const imbarcazione = await Imbarcazione.findByPk(mmsi);
    return await imbarcazione!.update(new_data!, {transaction: t!});
  }

  async delete(mmsi: number, _item_id2?: number, t?: Transaction): Promise<Imbarcazione | null> {
    const imbarcazione = await Imbarcazione.findByPk(mmsi);
    await imbarcazione!.destroy({ transaction: t! });
    return imbarcazione;
  }
}