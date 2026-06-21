import { AdminDAO } from "../dao/AdminDAO.js";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { UserCreationData } from "../models/UserModel.js";

export class AdminService {
  private readonly adminDAO = new AdminDAO();

  public getUtenti = async () => {
    return await this.adminDAO.findAll();
  };

  public getUtenteById = async (id: number) => {
    if (isNaN(id) || id <= 0) {
      throw ErrorFactory.getError(AppErrorEnum.INVALID_USERID);
    }

    const utente = await this.adminDAO.findById(id);

    if (!utente) {
      throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
    }

    // Torna l'utente che voglio vedere
    return { username: utente.username, email: utente.email, is_admin: utente.is_admin };
  };

  public updateUtente = async (id: number, data: Partial<UserCreationData>) => {
    const updated = await this.adminDAO.update(id, data);

    if (!updated) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }

    // Ritorna l'user aggiornato dopo l'update
    return await this.adminDAO.findById(id);
  };

  public deleteUtente = async (id: number) => {
    const deleted = await this.adminDAO.delete(id);

    if (!deleted) {
      throw ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }

    return SuccessFactory.getSuccess(AppSuccessEnum.USER_DELETED, null);
  };
}

export default AdminService;