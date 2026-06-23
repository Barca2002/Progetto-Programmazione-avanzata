import { AdminDAO } from "../dao/AdminDAO.js";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { UserCreationData } from "../models/UserModel.js";
import { DatabaseConnection } from "../singleton/DBConnection.js";
import { AuthService } from '../services/AuthService.js';

export class AdminService {
  private readonly adminDAO = new AdminDAO();
  private readonly authService = new AuthService();

  public createUtente = async (data: UserCreationData) => {
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      const result = await this.adminDAO.create(data, t);
      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
    }
  };

  public checkId = async(id: number) => {
    if (isNaN(id) || id <= 0) {
      throw ErrorFactory.getError(AppErrorEnum.INVALID_USERID);
    }
    const utente = await this.adminDAO.findById(id);
    if (!utente) {
      throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
    }
    return utente;
  }

  public findByEmail = async (email: string) => {
    const utente = await this.adminDAO.findByEmail(email);
    if (!utente)
      throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
    return utente;
  };

  public findByUsername = async (username: string) => {
    const utente = await this.adminDAO.findByUsername(username);
    if (!utente)
      throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
    return utente;
  };

  public getUtenti = async () => {
      return await this.adminDAO.findAll();
  };

  public getUtenteById = async (id: number) => {
    // Torna l'utente che voglio vedere
    return await this.checkId(id);
  };

  public updateUtente = async (id: number, data: Partial<UserCreationData>) => {
    // Controllo se l'id è corretto
    await this.checkId(id);
    // Controllo se l'username ed email inseriti già esistono
    if(data.username && await this.adminDAO.findByUsername(data.username)){
      throw ErrorFactory.getError(AppErrorEnum.USERNAME_ALREADY_EXISTS);
    }
    if(data.email && await this.adminDAO.findByEmail(data.email)){
      throw ErrorFactory.getError(AppErrorEnum.EMAIL_ALREADY_EXISTS);
    }
    // Se si vuole modificare la password, viene hashata prima della modifica.
    if(data.password){
      data.password = await this.authService.hashPassword(data.password!);
    }
    // Iniziamo la transazione e se va a buon fine ritorna l'user aggiornato,
    // altrimenti si fa il rollback.
    const t = await DatabaseConnection.getInstance().transaction();
    try{
      const result = await this.adminDAO.update(id, data, t);
      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      throw ErrorFactory.getError(AppErrorEnum.UPDATE_ERROR);
    }
  };

  public deleteUtente = async (id: number) => {
    await this.checkId(id);
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      await this.adminDAO.delete(id, t);
      await t.commit();
      return SuccessFactory.getSuccess(AppSuccessEnum.USER_DELETED, null);
    } catch (err) {
      await t.rollback();
      throw ErrorFactory.getError(AppErrorEnum.DELETE_ERROR);
    }
  };
}

export default AdminService;