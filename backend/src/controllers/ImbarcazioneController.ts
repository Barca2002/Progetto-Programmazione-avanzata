import { ImbarcazioneService } from "../services/ImbarcazioneService.js";
import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { AppError } from "../models/AppErrorModel.js";
import { checkToken } from "../middlewares/JWTMiddleware.js";
import { GeofenceareaService } from "../services/GeofenceareaService.js";

export class ImbarcazioneController {
  public readonly imbarcazioneService = new ImbarcazioneService();
  public readonly geofenceareaService = new GeofenceareaService();

  public async getImbarcazioneByMmsi(req: Request, res: Response) {
    try {
      const mmsi = Number(req.params.mmsi);
      const imbarcazione = await this.imbarcazioneService.getImbarcazioneByMmsi(mmsi);
      res.json(imbarcazione);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  // Funzione che ritorna all'admin tutte le imbarcazioni che sono in una geoarea.
  public async getAllImbarcazioniWithGeofenceareas(req: Request, res: Response): Promise<void> {
    try {
      const imbarcazioni = await this.imbarcazioneService.getAllImbarcazioniWithGeofenceareas();
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONI_GEOFENCES_FOUND, imbarcazioni));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };
  // Funzione che ritorna all'utente tutte le proprie imbarcazioni che sono in una geoarea.
  public async getUserImbarcazioniWithGeofenceareas(user_id: number) {
      const imbarcazioni = await this.imbarcazioneService.getUserImbarcazioniWithGeofenceareas(user_id);
      return imbarcazioni;
  
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
  public async linkGeoareasToImbarcazioni(req: Request, res: Response): Promise<void> {
    try {
      const links = req.body;

      if (!links || !Array.isArray(links)) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }

      await this.imbarcazioneService.linkGeoareasToImbarcazioni(links);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.GEOAREAS_LINKED, links));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
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
  public async unlinkGeoareasToImbarcazioni(req: Request, res: Response): Promise<void> {
    try {
      const { mmsi, geoarea_id } = req.body;

      if (!mmsi || !geoarea_id) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }

      await this.imbarcazioneService.deleteLinkGeoareaImbarcazione(mmsi, geoarea_id);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.AREA_DELETED, { mmsi, geoarea_id }));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async getAllWithSegnalazioni(req: Request, res: Response) {
    try {
      const imbarcazioni_segnalazioni = await this.imbarcazioneService.getAllWithSegnalazioni();
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONI_SEGNALAZIONI_FOUND, imbarcazioni_segnalazioni));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
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

      // Se si inserisce la data di fine si usa quella, altrimenti prendo la data al momento della richiesta
      const end_date = req.body.end_date ?  req.body.end_date: new Date().toLocaleDateString('it-IT');

      const posizioni = await this.imbarcazioneService.getPosizioniImbarcazioneAsGeoJson(mmsi, start_date, end_date);

      res.json(SuccessFactory.getSuccess(AppSuccessEnum.POSIZIONI_FOUND, posizioni));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async getSegnalazioniByMmsi(req: Request, res: Response) {
    try {
      const imbarcazione = await this.imbarcazioneService.getImbarcazioneByMmsi(req.body.mmsi);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONI_GEOFENCES_FOUND, imbarcazione));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async createImbarcazione(req: Request, res: Response) {
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
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async updateImbarcazione(req: Request, res: Response) {
    try {
      const mmsi = Number(req.params.mmsi);

      if (Number.isNaN(mmsi) || mmsi <= 0) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }

      await this.imbarcazioneService.updateImbarcazione(mmsi, req.body);
      const imbarcazioneAggiornata = await this.imbarcazioneService.getImbarcazioneByMmsi(mmsi);
      res.json(imbarcazioneAggiornata);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async deleteImbarcazione(req: Request, res: Response) {
    try {
      const mmsi = Number(req.params.mmsi);

      if (Number.isNaN(mmsi) || mmsi <= 0) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }

      await this.imbarcazioneService.deleteImbarcazione(mmsi);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONE_DELETED, null));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };
}