import { Transaction } from 'sequelize';
import { Violazione, ViolazioneCreationData } from '../models/ViolazioneModel.js';

interface IViolazioneDAO {
  create(data: ViolazioneCreationData, t: Transaction): Promise<Violazione>;
  findById(id: number): Promise<Violazione | null>;
  findAllByMmsi(mmsi: number): Promise<Violazione[] | null>;
  findAllByGeoarea(mmsi: number): Promise<Violazione[] | null>;
  findAll(): Promise<Violazione[]>;
  update(id: number, data: Partial<ViolazioneCreationData>, t: Transaction): Promise<Violazione>;
  delete(id: number, t: Transaction): Promise<number>;
}

export class ViolazioneDAO implements IViolazioneDAO {

  async create(data: ViolazioneCreationData, t: Transaction): Promise<Violazione> {
    return await Violazione.create(data, {transaction: t});
  }

  async findById(id: number): Promise<Violazione | null> {
    return await Violazione.findByPk(id);
  }

  async findAllByMmsi(mmsi: number): Promise<Violazione[] | null> {
    return await Violazione.findAll({ where: { mmsi } });
  }

  async findAllByGeoarea(geoarea_id: number): Promise<Violazione[] | null> {
    return await Violazione.findAll({ where: { geoarea_id }, order: [["created_at", "DESC"]] });
  }

  async findAll(): Promise<Violazione[]> {
    return await Violazione.findAll();
  }

  async update(id: number, data: Partial<ViolazioneCreationData>, t: Transaction): Promise<Violazione> {
    const [, affectedRows] = await Violazione.update(data, { where: { id: id }, transaction: t, returning: true });
    return affectedRows[0]!;
  }

  async delete(id: number, t: Transaction): Promise<number> {
    return await Violazione.destroy({ where: { id: id }, transaction: t });
  }
}