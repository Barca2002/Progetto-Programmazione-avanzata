import { User, UserCreationData } from '../models/UserModel.js';
import { Transaction } from 'sequelize';
import { InterfacciaDAO } from './InterfacciaDAO.js';


export class AdminDAO implements InterfacciaDAO<User> {
  /**
   * Funzione che crea un utente nel database.
   * @param data oggetto che implementa l'interfaccia UserCreationData, quindi che contiene i dati necessari per la creazioni.
   * @param t oggetto Transaction che rappresenta una transazione nel database.
   * @returns oggetto User.
   */
  public async create(data: UserCreationData, t: Transaction): Promise<User> {
    return await User.create(data, { transaction: t });
  }

  /**
   * Funzione che torna un utente con lo user_id passato come argomento o null nel caso non trovi l'utente
   * @param user_id 
   * @returns 
   */
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

  /**
   * Funzione che ritorna l'utente tramite l'email passata come argomento
   * @param email 
   * @returns 
   */
  public async getByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email: email } });
  }

  public async getByUsername(username: string): Promise<User | null> {
    return await User.findOne({ where: { username: username } });
  }

}



