import { Transaction } from 'sequelize';
import { User, UserCreationData } from '../models/UserModel.js';

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
    return await User.create(
      data, { transaction: t }
    );
  }

  async findById(user_id: number): Promise<User | null> {
    return await User.findByPk(user_id);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await User.findOne({
      where: { username }});
  }

  async findAll(): Promise<User[]> {
    return await User.findAll();
  }

  async update(user_id: number, data: Partial<UserCreationData>, t: Transaction): Promise<User> {
    const [, affectedRows] = await User.update(data, { where: { user_id }, transaction: t, returning: true });
    return affectedRows[0]!;
  }

  async decrToken(user_id: number, t: Transaction){
    
    const [affectedRows,] = await User.decrement( { tokens: 0.025 }, { where: { user_id }, transaction: t});
    return affectedRows;
  }

  async delete(user_id: number, t: Transaction): Promise<number> {
    return await User.destroy({
      where: { user_id },
      transaction: t });
  }
}
