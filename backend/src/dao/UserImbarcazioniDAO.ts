import { Transaction } from 'sequelize';
import { UserImbarcazioni } from '../models/UserImbarcazioniModel.js'
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { User } from '../models/UserModel.js';

// Interfaccia del layer DAO per l'associazione User-Imbarcazione
interface IUserImbarcazioniDAO {
  create(user_id: number, mmsi: number, t: Transaction): Promise<UserImbarcazioni>;
  findAssociation(user_id: number, mmsi: number): Promise<UserImbarcazioni | null>;
  findUserByMmsi(mmsi: number): Promise<User | null>;
  findOneByMmsi(mmsi: number): Promise<UserImbarcazioni | null>;
  findAllByUserId(user_id: number): Promise<UserImbarcazioni[]>;
  delete(user_id: number, mmsi: number, t: Transaction): Promise<number>;
}

export class UserImbarcazioniDAO implements IUserImbarcazioniDAO {
  async create(user_id: number, mmsi: number, t: Transaction): Promise<UserImbarcazioni> {
    return await UserImbarcazioni.create(
      { user_id, mmsi }, { transaction: t });
  }

  // Funzione per trovare l'associazione tramite user id e mmsi
  async findAssociation(user_id: number, mmsi: number): Promise<UserImbarcazioni | null> {
    return await UserImbarcazioni.findOne({
      where: { user_id, mmsi }});
  }

  async findUserByMmsi(mmsi: number): Promise<User | null> {
    const association = await UserImbarcazioni.findOne({ where: { mmsi } });
    if (!association) return null;
    return await User.findByPk(association.user_id);
  }

  async findOneByMmsi(mmsi: number): Promise<UserImbarcazioni | null> {
    return await UserImbarcazioni.findOne({
      where: { mmsi }});
}

  async findAllByUserId(user_id: number): Promise<UserImbarcazioni[]> {
      return await UserImbarcazioni.findAll({
        where: { user_id }
      });
  }

  async delete(user_id: number, mmsi: number, t: Transaction): Promise<number> {
      return await UserImbarcazioni.destroy({
        where: { user_id, mmsi }, transaction: t});
  }
}