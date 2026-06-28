import { ImbarcazioneService } from "../services/ImbarcazioneService.js";
import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { AppError } from "../models/AppErrorModel.js";
import { checkToken } from "../middlewares/JWTMiddleware.js";

export class ImbarcazioneController {
  public readonly imbarcazioneService = new ImbarcazioneService();

  public async getImbarcazioneByMmsi(req: Request, res: Response ){
    try {
      const mmsi = Number(req.params.mmsi);
      const imbarcazione = await this.imbarcazioneService.getImbarcazioneByMmsi(mmsi);
      res.json(imbarcazione);
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async getAllImbarcazioniWithGeofences(req: Request, res: Response ): Promise<void>{
    try {
      const imbarcazioni = await this.imbarcazioneService.getAllImbarcazioniWithGeofences();
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONI_GEOFENCES_FOUND, imbarcazioni));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async getMyImbarcazioniWithGeofences(req: Request, res: Response ): Promise<void>{
    try {
      const user_id = checkToken(req).user_id;
      const imbarcazioni = await this.imbarcazioneService.getMyImbarcazioniWithGeofences(user_id);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONI_GEOFENCES_FOUND, imbarcazioni));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  /*
  Body del link (vettore di associazioni):
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
  public async linkGeoareasToImbarcazioni(req: Request, res: Response ): Promise<void>{
    try {
      const links = req.body;

      if (!links || !Array.isArray(links)) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }

      await this.imbarcazioneService.linkGeoareasToImbarcazioni(links);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.GEOAREAS_LINKED, links));
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
  public async deleteGeoarea(req: Request, res: Response ): Promise<void>{
    try {
      const { mmsi, geoarea_id } = req.body;

      if (!mmsi || !geoarea_id) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }

      await this.imbarcazioneService.deleteGeoarea(mmsi, geoarea_id);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.AREA_DELETED, { mmsi, geoarea_id }));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async getAllWithSegnalazioni(req: Request, res: Response){
    try {
      const imbarcazioni_segnalazioni = await this.imbarcazioneService.getAllWithSegnalazioni();
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONI_SEGNALAZIONI_FOUND, imbarcazioni_segnalazioni));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  async getStatusPerGeoarea(req: Request, res: Response){
    try {
        const result = await this.imbarcazioneService.getStatusPerGeoarea();
        res.json(SuccessFactory.getSuccess(AppSuccessEnum.LOG_SPOSTAMENTI_FOUND, result));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async getPointsAsGeoJson(req: Request, res: Response): Promise<void> {
    try {
        const { mmsi, start_date } = req.body;

        if (!mmsi || !start_date) {
            throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
        }

        const end_date = req.body.end_date ? new Date(req.body.end_date) : new Date();

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
        }

        const posizioni = await this.imbarcazioneService.getPosizioniImbarcazione(mmsi,startDate, endDate);

        res.json(
            SuccessFactory.getSuccess(
                AppSuccessEnum.POSIZIONI_FOUND,
                posizioni
            )
        );

    } catch (err) {
        if (err instanceof AppError) {
            err.send(res);
        } else {
            res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
        }
    }
}

  public async getSegnalazioniByMmsi(req: Request, res: Response){
    try {
      const imbarcazione = await this.imbarcazioneService.getImbarcazioneByMmsi(req.body.mmsi);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONI_GEOFENCES_FOUND, imbarcazione));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async createImbarcazione(req: Request, res: Response ){
    try {
      const { mmsi, name, type } = req.body;

      if (!mmsi || !name || !type) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }

      if (String(mmsi).length !== 9) {
        throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI);
      }

      const nuovaImbarcazione = await this.imbarcazioneService.createImbarcazione(req.body);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONE_CREATED, nuovaImbarcazione));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async updateImbarcazione(req: Request, res: Response ){
    try {
      const mmsi = Number(req.params.mmsi);

      if (isNaN(mmsi) || mmsi <= 0) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }

      await this.imbarcazioneService.updateImbarcazione(mmsi, req.body);
      const imbarcazioneAggiornata = await this.imbarcazioneService.getImbarcazioneByMmsi(mmsi);
      res.json(imbarcazioneAggiornata);
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async deleteImbarcazione(req: Request, res: Response ){
    try {
      const mmsi = Number(req.params.mmsi);

      if (isNaN(mmsi) || mmsi <= 0) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }

      await this.imbarcazioneService.deleteImbarcazione(mmsi);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONE_DELETED, null));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };
}