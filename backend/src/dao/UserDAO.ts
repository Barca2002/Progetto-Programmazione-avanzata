import { Transaction } from 'sequelize';
import { User, UserCreationData } from '../models/UserModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';

// Interfaccia del layer DAO per la gestione dell'User
interface IUserDAO {
  create(data: UserCreationData, t: Transaction): Promise<User>;
  findById(user_id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(user_id: number, data: Partial<UserCreationData>, t: Transaction): Promise<User>;
  delete(user_id: number, t: Transaction): Promise<number>;
}

export class UserDAO implements IUserDAO {
  async create(data: UserCreationData, t: Transaction): Promise<User> {
    try {
      return await User.create(
        data, { transaction: t }
      );
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
    }
  }

  async findById(user_id: number): Promise<User | null> {
    try {
      return await User.findByPk(user_id);
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      return await User.findOne({
        where: { username }});
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await User.findAll();
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  async update(user_id: number, data: Partial<UserCreationData>, t: Transaction): Promise<User> {
    try {
      const [, affectedRows] = await User.update(data, { where: { user_id }, transaction: t, returning: true });
      return affectedRows[0]!;
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.UPDATE_ERROR);
    }
  }

  async delete(user_id: number, t: Transaction): Promise<number> {
    try {
      return await User.destroy({
        where: { user_id },
        transaction: t });
    } catch (err) {
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
    }
  }
}
