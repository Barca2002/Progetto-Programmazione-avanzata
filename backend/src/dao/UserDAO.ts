import { UserModel } from '../models/UserModel.js';
import { Model } from 'sequelize';
import type { UserAllData, UserCreation } from '../models/UserModel.js'; //Serve per importare le interfacce 

// Definisce il contratto del DAO: quali operazioni deve offrire
interface IUserDAO {
  create(data: UserCreation): Promise<Model<UserAllData, UserCreation>>;
  findById(user_id: number): Promise<Model<UserAllData, UserCreation> | null>;
  findAll(): Promise<Model<UserAllData, UserCreation>[]>;
  update(user_id: number, data: Partial<UserCreation>): Promise<number>;
  delete(user_id: number): Promise<number>; //restituisce il numero di righe affected, perciò Promise<number>
}

export class UserDAO implements IUserDAO{
  // Crea un nuovo utente, in base a UserCreation tutti i dati si devono inserire tranne idAdmin (opzionale) e user_id che non si può inserire nella creazione perché lo gestisce il db
  async create(data: UserCreation) {
    return await UserModel.create(data);
  }

  // Trova un utente per ID
  async findById(user_id: number) {
    return await UserModel.findByPk(user_id);
  }

  // Restituisce tutti gli utenti
  async findAll() {
    return await UserModel.findAll();
  }

  // Aggiorna un utente per ID, tutti i dati da inserire sono opzionali tranne user_id che non si può cambiare a prescindere
  async update(user_id: number, data: Partial<UserCreation>) {
    const [affectedCount] = await UserModel.update(data, { where: { user_id } });
    return affectedCount;
}

  // Elimina un utente per ID
  async delete(user_id: number) {
    return await UserModel.destroy({ where: { user_id } });
  }
}

export default UserDAO;