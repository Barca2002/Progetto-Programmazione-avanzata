import { User } from '../models/UserModel.js';
import { UserCreationData } from '../models/UserModel.js';
import { Transaction } from 'sequelize';

/*
* I DAO devono solo occuparsi effettuare operazioni basilari (CRUD) con i dati,
* quindi le eccezioni/errori devono essere gestiti nei service o controllers.
*/


interface IAdminDAO {
  create(data: UserCreationData, t: Transaction): Promise<User>;
  findAll(): Promise<User[]>;
  findByEmail(email: string): Promise<User | null>;
  findById(user_id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  update(user_id: number, data: Partial<UserCreationData>, t: Transaction): Promise<User>;
  updateTokenBalance(email: string, tokenAmount: number, t: Transaction): Promise<User>;
  delete(user_id: number, t: Transaction): Promise<number>; 
}

export class AdminDAO implements IAdminDAO {
  async create(data: UserCreationData, t: Transaction): Promise<User> {
    return await User.create(data, {transaction: t});
  }

  async findById(user_id: number): Promise<User | null> {
    return await User.findByPk(user_id);
  }

  async findAll(): Promise<User[]> {
    return await User.findAll();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email: email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await User.findOne({ where: { username: username } });      
  }

  async update(user_id: number, data: Partial<UserCreationData>, t: Transaction): Promise<User> {
    // Il vettore, nella prima posizione, contiene il numero di righe interessate
    // dalla modifica, nella seconda posizione contiene le righe interessate.
    const [, affectedRows] = await User.update(data, { where: { user_id: user_id }, transaction: t, returning: true });
    return affectedRows[0]!;
  }

  // Spostare nel service ed usare l'update
  async updateTokenBalance(email: string, tokenAmount: number, t: Transaction): Promise<User> {
    const [, affectedRows] = await User.update({ tokens: tokenAmount}, { where: { email }, transaction: t, returning: true });
    return affectedRows[0]!;
  }

  async delete(user_id: number, t: Transaction): Promise<number> {
      // Ritorna il numero di righe interessate dalla delete
    return await User.destroy({ where: { user_id: user_id }, transaction: t });
    
  }
}
