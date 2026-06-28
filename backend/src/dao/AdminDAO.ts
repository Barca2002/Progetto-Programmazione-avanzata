import { User } from '../models/UserModel.js';
import { UserCreationData } from '../models/UserModel.js';
import { Transaction } from 'sequelize';
import { InterfacciaDAO } from './InterfacciaDAO.js';

/*
* I DAO devono solo occuparsi effettuare operazioni basilari (CRUD) con i dati,
* quindi le eccezioni/errori devono essere gestiti nei service o controllers.
*/

/*
export interface InterfacciaDAO<T>{
    create(item: T, t: Transaction): Promise<T>;
    get(item_id1: number, item_id2?: number): Promise<T | null>;
    getAll(): Promise<T[]>; 
    update(item_id: number, item_id2?: number, new_data?: Partial<T>, t?: Transaction): Promise<T | null>;
    delete(item_id1: number, item_id2?: number, t?: Transaction): Promise<T | null>;
}
*/

export class AdminDAO implements InterfacciaDAO<User> {
  async create(data: UserCreationData, t: Transaction ): Promise<User> {
     return await User.create(data, {transaction: t});
  }

  async get(user_id: number, _item_id2?: number): Promise<User | null> {
    return await User.findByPk(user_id);
  }

  async getAll(): Promise<User[]> {
    return await User.findAll();
  }

  async update(user_id: number, _item_id2?: number, new_data?:Partial<UserCreationData>, t?: Transaction): Promise<User | null> {
    const user = await User.findByPk(user_id);
    return await user!.update(new_data!, {transaction: t!});
  }

  async delete(user_id: number, _item_id2?: number, t?: Transaction): Promise<User | null> {
    const user = await User.findByPk(user_id);
    await user!.destroy({ transaction: t! });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email: email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await User.findOne({ where: { username: username } });      
  }

}



//   // Spostare nel service ed usare l'update
//   async updateTokenBalance(email: string, tokenAmount: number, t: Transaction): Promise<User> {
//     const [, affectedRows] = await User.update({ tokens: tokenAmount}, { where: { email }, transaction: t, returning: true });
//     return affectedRows[0]!;
//   }