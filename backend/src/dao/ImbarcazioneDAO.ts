import { Op, Transaction } from 'sequelize';
import { Imbarcazione, ImbarcazioneCreationData } from '../models/ImbarcazioneModel.js';
import { InterfacciaDAO } from './InterfacciaDAO.js';
import { Datiinviati } from '../models/DatiInviatiModel.js';

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

  async getAllByUserId(user_id: number): Promise<Imbarcazione[]> {
    return await Imbarcazione.findAll({
      where: { user_id: user_id }
    });
  }
  
  async getPositionsByMmsiAndDateRange(mmsi: number, date_start: Date, date_end: Date): Promise<Datiinviati[]> {
    const start_date = date_start.getTime();
    const end_date = date_end.getTime();

  return await Datiinviati.findAll({
    where: {
      mmsi,
      created_at: { [Op.between]: [start_date, end_date] }
    }
  });
}


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