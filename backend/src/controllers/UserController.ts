import { UserDAO } from "../dao/UserDAO.js";
import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import bcrypt from 'bcrypt';
import { UserCreation } from "../models/UserModel.js";

export class UserController{

  public readonly userDAO = new UserDAO();
  public readonly saltRounds = 12;
  // Helper method per togliere la password al momento della risposta della creazione.
  public removePassword = (user: any) => {
    const userPlain = user.get({ plain: true });
    const { password, ...userWithoutPassword } = userPlain;
    return userWithoutPassword;
  };

  //Quando chiamo una qualsiasi di queste funzioni sotto, passo per il DAO (intermediario) che sa come tradurre le operazioni in operazioni di Sequelize, non uso direttamente quelle di Sequelize.
  public getUtenti = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const utenti = await this.userDAO.findAll();

      res.json(utenti);

    } catch (error) {
      return ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  };

  public getUtenteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0){
        return ErrorFactory.getError(AppErrorEnum.INVALID_USERID);
      }
      const userDAO = new UserDAO();
      const utente = await userDAO.findById(id);

      if (!utente) {
        return next(ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND));
      }

      //Torna l'utente che voglio vedere
      res.json(this.removePassword(utente));

    } catch (error) {
      return ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  };

  public createUtente = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if(await this.userDAO.findByEmail(req.body.email)){
        res.json(ErrorFactory.getError(AppErrorEnum.EMAIL_ALREADY_EXISTS));
      }
      if(await this.userDAO.findByUsername(req.body.username)){
        res.json(ErrorFactory.getError(AppErrorEnum.USERNAME_ALREADY_EXISTS));
      }
      const passwordHash = await bcrypt.hash(req.body.password.trim(), this.saltRounds);
      const userInfo: UserCreation = {
        "username": req.body.username.trim(),
        "email": req.body.email,
        "password": passwordHash,
        "is_admin": req.body.is_admin ?? false // Fallback false se non viene assegato
      }
      const nuovoUtente = await this.userDAO.create(userInfo);
      res.json(this.removePassword(nuovoUtente));

    } catch (error) {
      return ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR);
    }
  };

  public updateUtente = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const updated = await this.userDAO.update(id, req.body);

      if (!updated) {
        res.json(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }

      //mi ritorna l'user aggiornato dopo l'update
      const utenteAggiornato = await this.userDAO.findById(id);
      res.json(utenteAggiornato);

    } catch (error) {
      next(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
    }
  };

  public deleteUtente = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string);
      const deleted = await this.userDAO.delete(id);

      if (!deleted) {
        res.json(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }

      res.json(SuccessFactory.getSuccess(AppSuccessEnum.USER_DELETED, null));

    } catch (error) {
      next(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
    }
  };
}

