import { Transaction } from 'sequelize';
import { UserImbarcazioni } from '../models/UserImbarcazioniModel.js'
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';

// Interfaccia del layer DAO per l'associazione User-Imbarcazione
interface IUserImbarcazioniDAO {
  create(user_id: number, mmsi: number, t: Transaction): Promise<UserImbarcazioni>;
  findAssociation(user_id: number, mmsi: number): Promise<UserImbarcazioni | null>;
  findOneByMmsi(mmsi: number): Promise<UserImbarcazioni | null>;
  findAllByUserId(user_id: number): Promise<UserImbarcazioni[]>;
  delete(user_id: number, mmsi: number, t: Transaction): Promise<number>;
}

export class UserImbarcazioniDAO implements IUserImbarcazioniDAO {
  async create(user_id: number, mmsi: number, t: Transaction): Promise<UserImbarcazioni> {
    try {
      return await UserImbarcazioni.create(
        { user_id, mmsi }, { transaction: t });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  // Funzione per trovare l'associazione tramite user id e mmsi
  async findAssociation(user_id: number, mmsi: number): Promise<UserImbarcazioni | null> {
    try {
      return await UserImbarcazioni.findOne({
        where: { user_id, mmsi }});
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  async findOneByMmsi(mmsi: number): Promise<UserImbarcazioni | null> {
    try {
      return await UserImbarcazioni.findOne({
        where: { mmsi }});
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  async findAllByUserId(user_id: number): Promise<UserImbarcazioni[]> {
    try {
      return await UserImbarcazioni.findAll({
        where: { user_id }
      });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  async delete(user_id: number, mmsi: number, t: Transaction): Promise<number> {
    try {
      return await UserImbarcazioni.destroy({
        where: { user_id, mmsi }, transaction: t});
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
    }
  }
}