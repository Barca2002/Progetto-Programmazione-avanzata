import { User } from '../models/UserModel.js';
import { UserCreationData } from '../models/UserModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { Transaction } from 'sequelize';

interface IAdminDAO {
  create(data: UserCreationData, t: Transaction): Promise<User>;
  findAll(): Promise<User[]>;
  findById(user_id: number): Promise<User | null>;
  update(user_id: number, data: Partial<UserCreationData>, t: Transaction): Promise<User>;
  delete(user_id: number, t: Transaction): Promise<number>; 
}

export class AdminDAO implements IAdminDAO {
  async create(data: UserCreationData, t: Transaction): Promise<User> {
    try{
      return await User.create(data, {transaction: t});
    } catch (err){
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

  async findAll(): Promise<User[]> {
    try{
      return await User.findAll();
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.FIND_ERROR);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    // Siccome a noi serve che non trova l'email, non possiamo mettere l'errore metterlo
      return await User.findOne({ where: { email: email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    // Stessa cosa per l'username
      return await User.findOne({ where: { username: username } });
  }

  async update(user_id: number, data: Partial<UserCreationData>, t: Transaction): Promise<User> {
    try{
      const [affecterdCount, affectedRows] = await User.update(data, { where: { user_id: user_id }, transaction: t, returning: true });
      return affectedRows[0]!;
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.UPDATE_ERROR);
    }
  }

  async delete(user_id: number, t: Transaction): Promise<number> {
    try{
      // Ritorna il numero di righe interessate dalla delete
      return await User.destroy({ where: { user_id: user_id }, transaction: t });
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
    }
    
  }
}
