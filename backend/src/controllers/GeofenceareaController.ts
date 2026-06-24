import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { AppError } from "../models/AppErrorModel.js";
import { GeofenceareaService } from "../services/GeofenceareaService.js";
import type { Position } from 'geojson';
import { GeofenceareaCreationData } from "../models/GeofenceareaModel.js";
import { maxHeaderSize } from "http";

export class GeofenceAreaController {
  public readonly geofenceareaService = new GeofenceareaService();

  public async getAree(req: Request, res: Response, next: NextFunction){
    try {
      const aree = await this.geofenceareaService.getAree();
      res.json(aree);
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async getAreaById(req: Request, res: Response, next: NextFunction){
    try {
      const id = Number(req.params.id);
      const area = await this.geofenceareaService.getAreaById(id);
      res.json(area);
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async createArea(req: Request, res: Response, next: NextFunction){
    try {
      const name = req.body.features[0].properties.name;
      const coordinates = req.body.features[0].geometry.coordinates;
      const max_speed = req.body.features[0].properties.max_speed;
      if (!name || !coordinates){
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }
      /*
      // Lo standard di geojson richiede prima la longituide e poi la latitudine, quindi coppie [long, lat], ...
      
      GeoJSON richiede Position[][] (array di anelli, dove ogni anello è un array di punti):
      "coordinates": [ [ [125.6, 10.1], [124.6, 10.0], [124.0, 9.5], [125.6, 10.1] ] ]
      */
      const coordinatesGeoJson: Position[][] = coordinates;
      // Creazione della nuova area.
      const geoJsonArea: GeofenceareaCreationData = {
        name: name,
        area: {
          type: 'Polygon',
          coordinates: coordinatesGeoJson,
        },
        max_speed: max_speed ?? null, 
      };
      const nuovaArea = await this.geofenceareaService.createArea(geoJsonArea);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.GEOAREA_CREATED, nuovaArea));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        console.log(err);
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async updateArea(req: Request, res: Response, next: NextFunction){
    try {
      const id = Number(req.params.id);
      const areaAggiornata = await this.geofenceareaService.updateArea(id, req.body);
      res.json(areaAggiornata);
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async deleteArea(req: Request, res: Response, next: NextFunction){
    try {
      const id = Number(req.params.id);
      await this.geofenceareaService.deleteArea(id);
      const success = SuccessFactory.getSuccess(AppSuccessEnum.AREA_DELETED, null);
      res.json(success);
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };
}