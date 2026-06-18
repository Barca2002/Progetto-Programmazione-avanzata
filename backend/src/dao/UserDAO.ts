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
    return await UserModel.findByPk(user_id);
  }

  async findAll(): Promise<UserModel[]> {
    return await UserModel.findAll();
  }

  async update(user_id: number, data: Partial<UserCreation>): Promise<number> {
    const [affectedCount] = await UserModel.update(data, { where: { user_id } });
    return affectedCount;
  }

  async delete(user_id: number): Promise<number> {
    return await UserModel.destroy({ where: { user_id } });
  }
}

export default UserDAO;