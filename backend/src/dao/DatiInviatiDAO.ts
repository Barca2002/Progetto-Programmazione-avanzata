import { Datiinviati, DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
import { Transaction } from 'sequelize';
import { InterfacciaDAO } from './InterfacciaDAO.js';



export class DatiinviatiDAO implements InterfacciaDAO<Datiinviati> {

  async create(data: DatiinviatiCreationData, t: Transaction): Promise<Datiinviati> {
    return await Datiinviati.create(data, {transaction: t});
  }

  async findAllByMmsi(mmsi: number): Promise<Datiinviati[]> {
    return await Datiinviati.findAll({ where: { mmsi: mmsi } });
  }

  async get(user_id: number, _item_id2?: number): Promise<Datiinviati | null> {
    return await Datiinviati.findByPk(user_id);
  }

  async getLastDatoByMmsi(mmsi: number): Promise<Datiinviati | null> {
  return await Datiinviati.findOne({
    where: { mmsi },
    order: [['created_at', 'DESC']],
  });
}
  
  async getAll(): Promise<Datiinviati[]> {
    return await Datiinviati.findAll();
  }

  async update(dato_id: number, new_data:Partial<DatiinviatiCreationData>, t?: Transaction): Promise<Datiinviati | null> {
      const dato_inviato = await Datiinviati.findByPk(dato_id);
      return await dato_inviato!.update(new_data, {transaction: t!});
  }
  
  async delete(dato_id: number, t: Transaction): Promise<Datiinviati | null> {
    const dato_inviato = await Datiinviati.findByPk(dato_id);
    await dato_inviato!.destroy({ transaction: t });
    return dato_inviato;
  }

}
  


