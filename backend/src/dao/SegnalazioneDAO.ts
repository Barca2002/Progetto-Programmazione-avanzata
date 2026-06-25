import { Transaction } from 'sequelize';
import { Segnalazione, SegnalazioneCreationData } from '../models/SegnalazioneModel.js';

//Qui ci si occupa solo dell'esecuzione delle query, è il layer che parla col db
interface ISegnalazioneDAO {
  create(data: SegnalazioneCreationData, t: Transaction): Promise<Segnalazione>;
  findById(id: number): Promise<Segnalazione | null>;
  findAllByGeoarea(mmsi: number): Promise<Segnalazione[] | null>;
  findAll(): Promise<Segnalazione[]>;
  update(id: number, data: Partial<SegnalazioneCreationData>, t: Transaction): Promise<Segnalazione>;
  delete(id: number, t: Transaction): Promise<number>;
}

export class SegnalazioneDAO implements ISegnalazioneDAO {

  async create(data: SegnalazioneCreationData, t: Transaction): Promise<Segnalazione> {
    return await Segnalazione.create(data, {transaction: t});
  }

  async findById(id: number): Promise<Segnalazione | null> {
    return await Segnalazione.findByPk(id);
  }

  async findAllByGeoarea(geoarea_id: number): Promise<Segnalazione[] | null> {
    return await Segnalazione.findAll({ where: { geoarea_id } });
  }

  async findAll(): Promise<Segnalazione[]> {
    return await Segnalazione.findAll();
  }

  async update(id: number, data: Partial<SegnalazioneCreationData>, t: Transaction): Promise<Segnalazione> {
    const [, affectedRows] = await Segnalazione.update(data, { where: { id: id }, transaction: t, returning: true });
    return affectedRows[0]!;
  }

  async delete(id: number, t: Transaction): Promise<number> {
    return await Segnalazione.destroy({ where: { id: id }, transaction: t });
  }
}