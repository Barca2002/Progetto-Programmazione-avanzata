import { AdminDAO } from "../dao/AdminDAO.js";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { UserCreationData, UserUpdateData } from "../models/UserModel.js";
import { DatabaseConnection } from "../singleton/DBConnection.js";
import { AuthService } from '../services/AuthService.js';
import { AppError } from "../models/AppErrorModel.js";

export class AdminService {
  private readonly adminDAO = new AdminDAO();
  private readonly authService = new AuthService();

  /**
   * Funzione che crea un utente in base al parametro data.
   * @param data oggetto che implementa l'interfaccioa UserCreationData, quindi che contiene i dati necessari per la creazioni.
   * @returns oggetto User.
   */
  public async createUtente(data: UserCreationData) {
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      const result = await this.adminDAO.create(data, t);
      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError)
        throw err;
      throw ErrorFactory.getError(AppErrorEnum.CREATE_ERROR);
    }
  };

  /**
   * Funzione per trovare un utente tramite la sua e-mail, restituendo un errore nel caso di utente non trovato 
   * @param email 
   * @returns 
   */
  public async findByEmail(email: string) {
    const utente = await this.adminDAO.getByEmail(email);
    if (!utente)
      throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
    return utente;
  };

  /**
   * Funzione che controlla se esiste un utente con quell'id e, in caso positivo, restituisce l'utente
   * @param id numero che rappresenta l'id dell'utente.
   * @returns oggetto Utente.
   */
  public async getUtenteById(id: number) {
    this.authService.checkUserId(id);
    const utente = await this.adminDAO.get(id);
    if (!utente) {
      throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
    }
    return utente;
  };

  public async updateUtente(id: number, data: Partial<UserUpdateData>) {
    const inputFields = Object.keys(data);
    if (!data || inputFields.length === 0) {
      throw ErrorFactory.getError(AppErrorEnum.MISSING_DATA);
    }
    // Il saldo dei token e la data di creazione non possono essere modificati tramite questa funzione, quindi se vengono passati come parametri, viene lanciato un errore.
    if (data.tokens) {
      throw ErrorFactory.getError(AppErrorEnum.TOKEN_EDIT_NOT_ALLOWED);
    }
    if (data.created_at) {
      throw ErrorFactory.getError(AppErrorEnum.CREATEDAT_EDIT_NOT_ALLOWED);
    }

    // Controllo se l'id è corretto
    this.authService.checkUserId(id);
    // Controllo se l'username ed email inseriti già esistono
    if (data.username && await this.adminDAO.getByUsername(data.username)) {
      throw ErrorFactory.getError(AppErrorEnum.USERNAME_ALREADY_EXISTS);
    }
    if (data.email && await this.adminDAO.getByEmail(data.email)) {
      throw ErrorFactory.getError(AppErrorEnum.EMAIL_ALREADY_EXISTS);
    }
    // Se si vuole modificare la password, viene hashata prima della modifica.
    if (data.password) {
      data.password = await this.authService.hashPassword(data.password);
    }
    // Iniziamo la transazione e se va a buon fine ritorna l'user aggiornato,
    // altrimenti si fa il rollback.
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      const result = await this.adminDAO.update(id, data, t);
      if (!result) {
        await t.rollback();
        throw ErrorFactory.getError(AppErrorEnum.UPDATE_ERROR);
      }
      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError)
        throw err;
      throw ErrorFactory.getError(AppErrorEnum.UPDATE_ERROR);
    }
  };

  /**
   * Funzione per aggiornare il credito residuo di un utente passando l'email e il nuovo credito residuo, controllando che l'utente con quella e-mail esista
   * @param email 
   * @param tokenAmount 
   * @returns 
   */
  public async updateTokenBalance(email: string, tokenAmount: number) {
    const t = await DatabaseConnection.getInstance().transaction();
    try {
      if (!email) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }
      const user = await this.findByEmail(email);
      if (user.tokens <= 0) {
        throw ErrorFactory.getError(AppErrorEnum.TOKEN_SPEND_ERROR);
      }
      const result = await user.update({ tokens: tokenAmount }, { transaction: t });
      await t.commit();
      return SuccessFactory.getSuccess(AppSuccessEnum.TOKEN_BALANCE_UPDATED, result.tokens);
    } catch (err) {
      await t.rollback();
      if (err instanceof AppError)
        throw err;
      throw ErrorFactory.getError(AppErrorEnum.UPDATE_ERROR);
    }
  }
}

export default AdminService;