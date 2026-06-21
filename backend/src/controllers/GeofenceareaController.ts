import { GeofenceareaDAO } from "../dao/GeofenceareaDAO.js";
import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { AppError } from "../models/AppErrorModel.js";
import { Geofencearea } from "../models/GeofenceareaModel.js";

export class GeofenceAreaController{

  public readonly geofenceAreaDAO = new GeofenceareaDAO();

  //Quando chiamo una qualsiasi di queste funzioni sotto, passo per il DAO (intermediario) che sa come tradurre le operazioni in operazioni di Sequelize, non uso direttamente quelle di Sequelize.
  public getAree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const aree = await this.geofenceAreaDAO.findAll();

      res.json(aree);

    } catch (err) {
      if (err instanceof AppError){
          (err as AppError).send(res)
      } else {
          res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public getAreaById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0){
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }

      const area = await this.geofenceAreaDAO.findById(id);

      if (!area) {
        return next(ErrorFactory.getError(AppErrorEnum.GEOAREA_NOT_FOUND));
      }

      //Torna l'area che voglio vedere
      res.json(area);

    } catch (err) {
      if (err instanceof AppError){
          (err as AppError).send(res)
      } else {
          res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public createArea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, area } = req.body;
    if (!name || !area) {
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }

    const nuovaArea: Geofencearea = await this.geofenceAreaDAO.create(req.body);
    res.json(SuccessFactory.getSuccess(AppSuccessEnum.GEOAREA_CREATED, nuovaArea ));

  } catch (err) {
    if (err instanceof AppError) {
      (err as AppError).send(res);
    } else {
      res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
    }
    }
  };
  


  public updateArea = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const updated = await this.geofenceAreaDAO.update(id, req.body);

      if (!updated) {
        res.json(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }

      //mi ritorna l'area aggiornata dopo l'update
      const areaAggiornata = await this.geofenceAreaDAO.findById(id);
      res.json(areaAggiornata);

    } catch (err) {
      if (err instanceof AppError){
          (err as AppError).send(res)
      } else {
          res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public deleteArea = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const deleted = await this.geofenceAreaDAO.delete(id);

      if (!deleted) {
        res.json(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }

      res.json(SuccessFactory.getSuccess(AppSuccessEnum.AREA_DELETED, null));

    } catch (err) {
      if (err instanceof AppError){
          (err as AppError).send(res)
      } else {
          res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };
}