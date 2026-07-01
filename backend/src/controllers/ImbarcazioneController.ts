import { ImbarcazioneService } from "../services/ImbarcazioneService.js";
import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { AppError } from "../models/AppErrorModel.js";
import { GeofenceareaService } from "../services/GeofenceareaService.js";
import { GeoAreaLinkData, PointsAsGeoJsonData } from "./AdminController.js";
import { ImbarcazioneCreationData } from "../models/ImbarcazioneModel.js";
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";


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
  }

  // Funzione che ritorna all'adminController tutte le imbarcazioni che sono in una geoarea.
  public async getAllImbarcazioniWithGeofenceareas(){
    return await this.imbarcazioneService.getAllImbarcazioniWithGeofenceareas();
  }
  // Funzione che ritorna all'utente tutte le proprie imbarcazioni che sono in una geoarea.
  public async getUserImbarcazioniWithGeofenceareas(user_id: number) {
      const imbarcazioni = await this.imbarcazioneService.getUserImbarcazioniWithGeofenceareas(user_id);
      return imbarcazioni;
  
  }

  /*
  Body della rotta di link (vettore di associazioni):
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
  public async linkGeoareasToImbarcazioni(links: GeoAreaLinkData[]): Promise<void> {
      return await this.imbarcazioneService.linkGeoareasToImbarcazioni(links);
  }

  /*
  Body della unlink:
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
  }

  // Funzione chiamata dall'adminController per ottenere tutte le imbarcazioni con le relative segnalazioni.
  public async getAllImbarcazioniWithSegnalazioni() {
      const imbarcazioni_segnalazioni = await this.imbarcazioneService.getAllImbarcazioniWithSegnalazioni();
      return imbarcazioni_segnalazioni;
  }

   // Funzione chiamata dall'userController per ottenere tutte le proprie imbarcazioni con le relative segnalazioni.
  public async getUserImbarcazioniWithSegnalazioni(user_id: number) {
    const my_imbarcazioni_segnalazioni = await this.imbarcazioneService.getUserImbarcazioniWithSegnalazioni(user_id);
    return my_imbarcazioni_segnalazioni;
  }

  // Funzione chiamata dall'adminController per ottenere tutte le posizioni in formato GeoJson di un'imbarcazione.
  public async getPointsAsGeoJson(data: PointsAsGeoJsonData): Promise<FeatureCollection<Geometry, GeoJsonProperties>> {
     return await this.imbarcazioneService.getPosizioniImbarcazioneAsGeoJson(data.mmsi, data.start_date, data.end_date);
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

  public async createImbarcazione(data: ImbarcazioneCreationData) {
      return await this.imbarcazioneService.createImbarcazione(data);
  }

  public async updateImbarcazione(req: Request, res: Response) {
    try {
      const mmsi = Number(req.params.mmsi);
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
  }

  public async deleteImbarcazione(req: Request, res: Response) {
    try {
      const mmsi = Number(req.params.mmsi);
      await this.imbarcazioneService.deleteImbarcazione(mmsi);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONE_DELETED, null));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }
}