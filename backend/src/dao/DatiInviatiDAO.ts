import { Datiinviati, DatiinviatiCreationData } from '../models/DatiInviatiModel.js';
import { Transaction } from 'sequelize';
import { InterfacciaDAO } from './InterfacciaDAO.js';



export class DatiinviatiDAO implements InterfacciaDAO<Datiinviati> {

  public async create(data: DatiinviatiCreationData, t: Transaction): Promise<Datiinviati> {
    return await Datiinviati.create(data, {transaction: t});
  }

  public async findAllByMmsi(mmsi: number): Promise<Datiinviati[]> {
    return await Datiinviati.findAll({ where: { mmsi: mmsi } });
  }

  public async get(user_id: number): Promise<Datiinviati | null> {
    return await Datiinviati.findByPk(user_id);
  }

  public async getLastDatoByMmsi(mmsi: number): Promise<Datiinviati | null> {
  return await Datiinviati.findOne({
    where: { mmsi },
    order: [['created_at', 'DESC']],
  });
}
  
  public async getAll(): Promise<Datiinviati[]> {
    return await Datiinviati.findAll();
  }

  public async update(dato_id: number, new_data:Partial<DatiinviatiCreationData>, t?: Transaction): Promise<Datiinviati | null> {
      const dato_inviato = await Datiinviati.findByPk(dato_id);
      return await dato_inviato!.update(new_data, {transaction: t!});
  }
  
  public async delete(dato_id: number, t: Transaction): Promise<Datiinviati | null> {
    const dato_inviato = await Datiinviati.findByPk(dato_id);
    await dato_inviato!.destroy({ transaction: t });
    return dato_inviato;
  }

}
  


