import { AdminDAO } from "../dao/AdminDAO.js";
import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { AppError } from "../models/AppErrorModel.js";

export class AdminController{

  public readonly AdminDAO = new AdminDAO();
  public readonly saltRounds = 12;

  //Quando chiamo una qualsiasi di queste funzioni sotto, passo per il DAO (intermediario) che sa come tradurre le operazioni in operazioni di Sequelize, non uso direttamente quelle di Sequelize.
  public getUtenti = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const utenti = await this.AdminDAO.findAll();

      res.json(utenti);

    } catch (err) {
      if (err instanceof AppError){
          (err as AppError).send(res)
      } else {
          res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public getUtenteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_USERID);
      }
      
      const utente = await this.AdminDAO.findById(id);

      if (!utente) {
        return next(ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND));
      }

      //Torna l'utente che voglio vedere
      const responseData = {"username": utente.username, "email": utente.email, "is_admin": utente.is_admin};

      res.json(responseData);

    } catch (err) {
      if (err instanceof AppError){
          (err as AppError).send(res)
      } else {
          res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public updateUtente = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const updated = await this.AdminDAO.update(id, req.body);

      if (!updated) {
        res.json(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }

      //mi ritorna l'user aggiornato dopo l'update
      const utenteAggiornato = await this.AdminDAO.findById(id);
      res.json(utenteAggiornato);

    } catch (err) {
      if (err instanceof AppError){
          (err as AppError).send(res)
      } else {
          res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public deleteUtente = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string);
      const deleted = await this.AdminDAO.delete(id);

      if (!deleted) {
        res.json(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }

      res.json(SuccessFactory.getSuccess(AppSuccessEnum.USER_DELETED, null));

    } catch (err) {
      if (err instanceof AppError){
          (err as AppError).send(res)
      } else {
          res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };
}

