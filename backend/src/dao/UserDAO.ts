import { UserModel } from '../models/UserModel.js';
import type { UserCreation } from '../models/UserModel.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';

interface IUserDAO {
  create(data: UserCreation): Promise<UserModel>;
  findById(user_id: number): Promise<UserModel | null>;
  findAll(): Promise<UserModel[]>;
  update(user_id: number, data: Partial<UserCreation>): Promise<number>;
  delete(user_id: number): Promise<number>; 
}

export class UserDAO implements IUserDAO {
  async create(data: UserCreation): Promise<UserModel> {
    try{
      let utente = await UserModel.create(data);
      return utente;
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }
    
  }

  async findById(user_id: number): Promise<UserModel | null> {
    try{
      return await UserModel.findByPk(user_id);
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
    }
  }

  async findAll(): Promise<UserModel[]> {
    try{
      return await UserModel.findAll();
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    // Siccome a noi serve che non trova l'email, non possiamo mettere l'errore metterlo
      return await UserModel.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<UserModel | null> {
    // Stessa cosa per l'username
      return await UserModel.findOne({ where: { username } });
  }

  async update(user_id: number, data: Partial<UserCreation>): Promise<number> {
    try{
      const [affectedCount] = await UserModel.update(data, { where: { user_id } });
      return affectedCount;
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  }

  async delete(user_id: number): Promise<number> {
    try{
      return await UserModel.destroy({ where: { user_id } });
    } catch (err){
      throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
    }
    
  }
}

export default UserDAO;