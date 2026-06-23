import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { AppError } from "../models/AppErrorModel.js";
import { GeofenceareaService } from "../services/GeofenceareaService.js";
import type { Position, Feature, Polygon } from 'geojson';

export class GeofenceAreaController {
  public readonly geofenceareaService = new GeofenceareaService();

  public async getAree(req: Request, res: Response, next: NextFunction) {
    try {
      const aree = await this.geofenceareaService.getAree();
      res.json(aree);
    } catch (err) {
      err instanceof AppError ? err.send(res) : res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
    }
  };

  public async getAreaById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0)
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      res.json(await this.geofenceareaService.getAreaById(id));
    } catch (err) {
      err instanceof AppError ? err.send(res) : res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
    }
  };

  public async createArea(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, coordinates } = req.body;
      if (!name || !coordinates){
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }

      // area attesa: array di coordinate tipo [[[lng, lat], [lng, lat], ...]]
    // esempio Polygon GeoJSON
    const coordinatesGeoJson: Position[][] = coordinates;

    if (!Array.isArray(coordinatesGeoJson) || !Array.isArray(coordinatesGeoJson[0]) ||
      coordinatesGeoJson[0].length < 4
    ) {
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }

      const geoJsonArea: Feature<Polygon> = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates,
      },
      properties: {
        name,
      },
    };

      const nuovaArea = await this.geofenceareaService.createArea(geoJsonArea);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.GEOAREA_CREATED, nuovaArea));
    } catch (err) {
      err instanceof AppError ? err.send(res) : res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
    }
  };

  public async updateArea(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0)
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      res.json(await this.geofenceareaService.updateArea(id, req.body));
    } catch (err) {
      err instanceof AppError ? err.send(res) : res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
    }
  };

  public async deleteArea(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0)
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      await this.geofenceareaService.deleteArea(id);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.AREA_DELETED, null));
    } catch (err) {
      err instanceof AppError ? err.send(res) : res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
    }
  };
}