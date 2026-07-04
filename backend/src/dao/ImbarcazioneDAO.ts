import { Op, Transaction } from 'sequelize';
import { Imbarcazione, ImbarcazioneCreationData } from '../models/ImbarcazioneModel.js';
import { InterfacciaDAO } from './InterfacciaDAO.js';
import { Datiinviati } from '../models/DatiInviatiModel.js';

export class ImbarcazioneDAO implements InterfacciaDAO<Imbarcazione> {
  public async create(data: ImbarcazioneCreationData, t: Transaction): Promise<Imbarcazione> {
    return await Imbarcazione.create(data, { transaction: t });
  }

  public async get(mmsi: number): Promise<Imbarcazione | null> {
    return await Imbarcazione.findByPk(mmsi);
  }

  public async getAll(): Promise<Imbarcazione[]> {
    return await Imbarcazione.findAll();
  }

  public async getByUserId(user_id: number): Promise<Imbarcazione | null> {
    return await Imbarcazione.findOne({
      where: { user_id: user_id }
    });
  }

  public async getByName(name: string): Promise<Imbarcazione | null> {
    return await Imbarcazione.findOne({
      where: { name: name }
    });
  }

  /**
   * Restituisce tutte le imbarcazioni in base all'id utente.
   * @param user_id numero che rappresenta l'id dell'utente.
   * @returns lista d'imbarcazioni.
   */
  public async getAllByUserId(user_id: number): Promise<Imbarcazione[]> {
    return await Imbarcazione.findAll({
      where: { user_id: user_id }
    });
  }

  public async getPositionsByMmsiAndDateRange(mmsi: number, start_date: Date, end_date: Date): Promise<Datiinviati[]> {
    //Per via del formato linux epoch con cui sono salvati i dati inviati
    return await Datiinviati.findAll({
      where: {
        mmsi,
        created_at: { [Op.between]: [start_date.getTime(), end_date.getTime()] }
      }
    });
  }

  public async update(mmsi: number, new_data: Partial<ImbarcazioneCreationData>, t: Transaction): Promise<Imbarcazione | null> {
    const imbarcazione = await Imbarcazione.findByPk(mmsi);
    return await imbarcazione!.update(new_data, { transaction: t });
  }

  public async delete(mmsi: number, t: Transaction): Promise<Imbarcazione | null> {
    const imbarcazione = await Imbarcazione.findByPk(mmsi);
    await imbarcazione!.destroy({ transaction: t });
    return imbarcazione;
  }
}