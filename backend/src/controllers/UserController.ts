import { UserDAO } from "../dao/UserDAO.js";
import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";

// Helper method per togliere la password al momento della risposta della creazione.
const removePassword = (user: any) => {
  const userPlain = user.get({ plain: true });
  const { password, ...userWithoutPassword } = userPlain;
  return userWithoutPassword;
};

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
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0){
      return next(ErrorFactory.getError(AppErrorEnum.INVALID_USERID));
    }
    const userDAO = new UserDAO();
    const utente = await userDAO.findById(id);

    if (!utente) {
      return next(ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND));
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
    console.log(nuovoUtente);
    res.json(removePassword(nuovoUtente));

  } catch (error) {
    next(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
  }
};

export const updateUtente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
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