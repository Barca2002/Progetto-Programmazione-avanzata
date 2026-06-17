import { UserDAO } from "../patterns/dao/UserDAO.js";
import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../patterns/factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";


//Quando chiamo una qualsiasi di queste funzioni sotto, passo per il DAO (intermediario) che sa come tradurre le operazioni in operazioni di Sequelize, non uso direttamente quelle di Sequelize.
export const getUtenti = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userDAO = new UserDAO();
    const utenti = await userDAO.findAll();

    res.json(utenti);

  } catch (error) {
    next(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
  }
};

export const getUtenteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id; //Vuole per forza che sia 
    const userDAO = new UserDAO();
    const utente = await userDAO.findById(parseInt(id));

    if (!utente) {
      return next(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
    }

    //Torna l'utente che voglio vedere
    res.json(utente);

  } catch (error) {
    next(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
  }
};

export const createUtente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userDAO = new UserDAO();
    const nuovoUtente = await userDAO.create(req.body);

    res.json(nuovoUtente);

  } catch (error) {
    next(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
  }
};

export const updateUtente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const userDAO = new UserDAO();
    const updated = await userDAO.update(id, req.body);

    if (!updated) {
      return next(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
    }

    //mi ritorna l'user aggiornato dopo l'update
    const utenteAggiornato = await userDAO.findById(id);
    res.json(utenteAggiornato);

  } catch (error) {
    next(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
  }
};

export const deleteUtente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const userDAO = new UserDAO();
    const deleted = await userDAO.delete(id);

    if (!deleted) {
      return next(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
    }

    res.json({ message: "USER_DELETED" });

  } catch (error) {
    next(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
  }
};