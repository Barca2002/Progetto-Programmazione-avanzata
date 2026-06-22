import { AdminService } from "../services/AdminService.js";
import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import { AppError } from "../models/AppErrorModel.js";

export class AdminController {
  public readonly adminService = new AdminService();

  // Quando chiamo una qualsiasi di queste funzioni sotto, passo per il Service che
  // contiene la logica di business, il quale a sua volta usa il DAO come intermediario
  // che sa come tradurre le operazioni in operazioni di Sequelize.
  public getUtenti = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const utenti = await this.adminService.getUtenti();
      res.json(utenti);
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public getUtenteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const responseData = await this.adminService.getUtenteById(id);
      // Ritorno le informazioni dell'utente togliendo info sensibili come la password
      const { username, email, is_admin } = responseData;
      res.json({username, email, is_admin});
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public updateUtente = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const utenteAggiornato = await this.adminService.updateUtente(id, req.body);
      res.json(utenteAggiornato);
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public deleteUtente = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const result = await this.adminService.deleteUtente(id);
      res.json(result);
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };
}