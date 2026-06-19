import { User } from '../models/UserModel.js';
import type { UserCreationData } from '../models/UserModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';

interface IUserDAO {
  create(data: UserCreationData): Promise<User>;
  findById(user_id: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(user_id: number, data: Partial<UserCreationData>): Promise<number>;
  delete(user_id: number): Promise<number>; 
}

export class UserDAO implements IUserDAO {
  async create(data: UserCreationData): Promise<User> {
    try{
      let utente = await User.create(data);
      return utente;
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }
    
  }

  async findById(user_id: number): Promise<User | null> {
    try{
      return await User.findByPk(user_id);
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
    }
  }

  async findAll(): Promise<User[]> {
    try{
      return await User.findAll();
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    // Siccome a noi serve che non trova l'email, non possiamo mettere l'errore metterlo
      return await User.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    // Stessa cosa per l'username
      return await User.findOne({ where: { username } });
  }

  async update(user_id: number, data: Partial<UserCreationData>): Promise<number> {
    try{
      const [affectedCount] = await User.update(data, { where: { user_id } });
      return affectedCount;
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async delete(user_id: number): Promise<number> {
    try{
      return await User.destroy({ where: { user_id } });
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
    }
    
  }
}

export default UserDAO;