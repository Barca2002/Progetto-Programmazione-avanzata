import { ImbarcazioneDAO } from "../dao/ImbarcazioneDAO.js";
import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { AppError } from "../models/AppErrorModel.js";
import { Imbarcazione } from "../models/ImbarcazioneModel.js";

export class ImbarcazioneController{

  public readonly imbarcazioneDAO = new ImbarcazioneDAO();

  //Quando chiamo una qualsiasi di queste funzioni sotto, passo per il DAO (intermediario) che sa come tradurre le operazioni in operazioni di Sequelize, non uso direttamente quelle di Sequelize.
  public getImbarcazioni = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const imbarcazioni = await this.imbarcazioneDAO.findAll();

      res.json(imbarcazioni);

    } catch (err) {
      if (err instanceof AppError){
          (err as AppError).send(res)
      } else {
          res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public getImbarcazioneById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mmsi = Number(req.params.mmsi);
      if (isNaN(mmsi) || mmsi <= 0){
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }
      
      const imbarcazione = await this.imbarcazioneDAO.findById(mmsi);

      if (!imbarcazione) {
        return next(ErrorFactory.getError(AppErrorEnum.IMBARCAZIONE_NOT_FOUND));
      }

      //Torna l'imbarcazione che voglio vedere
      res.json(imbarcazione);

    } catch (err) {
      if (err instanceof AppError){
          (err as AppError).send(res)
      } else {
          res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };


  // FUNZIONE CHIAMATA DALLA ROTTA ADMIN PER TORNARE L'ELENCO COMPLETO FRA IMBARCAZIONI E GEOFENCE AREAS ASSOCIATE AD OGNUNA
  public getAllImbarcazioniWithGeofences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const imbarcazioni = await this.imbarcazioneDAO.findAllGeofences();
        res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONI_GEOFENCES_FOUND, imbarcazioni as any));
    } catch (err) {
          if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  // FUNZIONE CHIAMATA DALL'UTENTE LOGGATO PER VEDERE LE SUE IMBARCAZIONI CON GEOFENCE ASSOCIATE
  public getMyImbarcazioniWithGeofences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user_id = (req as any).userLoggato.user_id; //è l'id dello user che avevo appeso dalla richiesta quando faccio il checkUser nel Middleware, chiamando la funzione checkToken da cui prende la req
      const imbarcazioni = await this.imbarcazioneDAO.findAllByUserWithGeofences(user_id);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONI_GEOFENCES_FOUND, imbarcazioni as any));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };


  /*
  Body della add (vettore di associazioni):
  [
      {
          "mmsi": 247112233,
          "geoarea_ids": [1, 2],
          "user_id": 4
      },
      {
          "mmsi": 247123456,
          "geoarea_ids": [6, 4, 2],
          "user_id": 2
      }
  ]
  */
  
  // AGGIUNGERE UNA O PIU GEOAREAS E USER A UNA O PIU IMBARCAZIONI
  public addGeoareasEUserToImbarcazioni = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const links = req.body;

        if (!links || !Array.isArray(links)) {
          throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
        }
        await this.imbarcazioneDAO.addGeoareasEUserToImbarcazioni(links);
        res.json(SuccessFactory.getSuccess(AppSuccessEnum.GEOAREAS_E_USER_ADDED, links as any));
    } catch (err) {
        if (err instanceof AppError) {
            (err as AppError).send(res);
        } else {
            res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
        }
    }
  };

  /*
  Body della delete:
  {
    "mmsi": 247123456,
    "geoarea_id": 1
  }
  */

  public deleteGeoarea = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const links = req.body;

        if (!links || typeof links.mmsi === 'undefined' || typeof links.geoarea_id === 'undefined') {
          throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
        }
        await this.imbarcazioneDAO.deleteGeoarea(links);
        res.json(SuccessFactory.getSuccess(AppSuccessEnum.AREA_DELETED, links as any));
    } catch (err) {
        if (err instanceof AppError) {
            (err as AppError).send(res);
        } else {
            res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
        }
    }
  };

  public createImbarcazione = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mmsi, name, type } = req.body;

    if (!mmsi || !name || !type) {
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }

    if (String(mmsi).length !== 9) { //standard dell'msi, numero 9 cifre
      throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI);
    }

    const nuovaImbarcazione: Imbarcazione = await this.imbarcazioneDAO.create(req.body);
    res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONE_CREATED, nuovaImbarcazione  as any));

  } catch (err) {
    if (err instanceof AppError) {
      (err as AppError).send(res);
    } else {
      res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
    }
  }
};

  public updateImbarcazione = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mmsi = Number(req.params.mmsi);
      const updated = await this.imbarcazioneDAO.update(mmsi, req.body);

      if (!updated) {
        res.json(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }

      //mi ritorna l'imbarcazione aggiornata dopo l'update
      const imbarcazioneAggiornata = await this.imbarcazioneDAO.findById(mmsi);
      res.json(imbarcazioneAggiornata);

    } catch (err) {
      if (err instanceof AppError){
          (err as AppError).send(res)
      } else {
          res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public deleteImbarcazione = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mmsi = parseInt(req.params.mmsi as string);
      const deleted = await this.imbarcazioneDAO.delete(mmsi);

      if (!deleted) {
        res.json(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }

      res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONE_DELETED, null));

    } catch (err) {
      if (err instanceof AppError){
          (err as AppError).send(res)
      } else {
          res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };
}