import { UserDAO } from "../patterns/dao/UserDAO.js";
import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../patterns/factory/ErrorFactory.js";
import { AppErrorNames } from "../utils/StatusMessages.js";

export const getUtenti = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userDAO = new UserDAO();

    const utenti = await userDAO.findAll();

    res.json(utenti);

  } catch (error) {
    next(ErrorFactory.getError(AppErrorNames.INTERNAL_ERROR));
  }
};

export const getUtenteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);

    const userDAO = new UserDAO();

    const utente = await userDAO.findById(id);

    if (!utente) {
      return next(ErrorFactory.getError(AppErrorNames.INTERNAL_ERROR));
    }

    res.json(utente);

  } catch (error) {
    next(ErrorFactory.getError(AppErrorNames.INTERNAL_ERROR));
  }
};

export const createUtente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userDAO = new UserDAO();

    const nuovoUtente = await userDAO.create(req.body);

    res.json(nuovoUtente);

  } catch (error) {
    next(ErrorFactory.getError(AppErrorNames.INTERNAL_ERROR));
  }
};

export const updateUtente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);

    const userDAO = new UserDAO();

    const updated = await userDAO.update(id, req.body);

    if (!updated) {
      return next(ErrorFactory.getError(AppErrorNames.INTERNAL_ERROR));
    }

    const utenteAggiornato = await userDAO.findById(id);

    res.json(utenteAggiornato);

  } catch (error) {
    next(ErrorFactory.getError(AppErrorNames.INTERNAL_ERROR));
  }
};

export const deleteUtente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);

    const userDAO = new UserDAO();

    const deleted = await userDAO.delete(id);

    if (!deleted) {
      return next(ErrorFactory.getError(AppErrorNames.INTERNAL_ERROR));
    }

    res.json({ message: "USER_DELETED" });

  } catch (error) {
    next(ErrorFactory.getError("INTERNAL_ERROR"));
  }
};