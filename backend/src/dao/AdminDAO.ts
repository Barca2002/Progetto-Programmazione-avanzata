import { User, UserCreationData } from '../models/UserModel.js';
import { Transaction } from 'sequelize';
import { InterfacciaDAO } from './InterfacciaDAO.js';

/*
* I DAO devono solo occuparsi effettuare operazioni basilari (CRUD) con i dati,
* quindi le eccezioni/errori devono essere gestiti nei service o controllers.
*/

export class AdminDAO implements InterfacciaDAO<User> {
  public async create(data: UserCreationData, t: Transaction): Promise<User> {
    return await User.create(data, { transaction: t });
  }

  public async get(user_id: number): Promise<User | null> {
    return await User.findByPk(user_id);
  }

  public async getAll(): Promise<User[]> {
    return await User.findAll();
  }

  public async update(user_id: number, new_data: Partial<UserCreationData>, t: Transaction): Promise<User | null> {
    const user = await User.findByPk(user_id);
    if (!user) {
      return null;
    }
    return await user.update(new_data, { transaction: t });
  }

  public async delete(user_id: number, t: Transaction): Promise<User | null> {
    const user = await User.findByPk(user_id);
    if (!user) {
      return null;
    }
    await user.destroy({ transaction: t });
    return user;
  }

  public async getByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email: email } });
  }

  public async getByUsername(username: string): Promise<User | null> {
    return await User.findOne({ where: { username: username } });
  }

}



