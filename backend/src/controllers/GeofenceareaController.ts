import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { AppError } from "../models/AppErrorModel.js";
import { GeofenceareaService } from "../services/GeofenceareaService.js";
import type { Position } from 'geojson';
import { GeofenceareaCreationData } from "../models/GeofenceareaModel.js";

export class GeofenceAreaController {
  public readonly geofenceareaService = new GeofenceareaService();

  public getAree = async (req: Request, res: Response, next: NextFunction) => {
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

  public getAreaById = async (req: Request, res: Response, next: NextFunction) => {
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

  public createArea = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, coordinates, max_speed } = req.body;
      if (!name || !coordinates){
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }
      /*
      Le coordinate nel body arrivano come array di punti (Position[]):
      "coordinates": 
      [ 
        [125.6, 10.1], [124.6, 10.0], [124.0, 9.5], [125.6, 10.1] 
      ]
      
      GeoJSON richiede Position[][] (array di anelli, dove ogni anello è un array di punti), quindi wrappiamo in un array esterno per ottenere il formato corretto (coordinatesGeoJson):
      "coordinates": [ [ [125.6, 10.1], [124.6, 10.0], [124.0, 9.5], [125.6, 10.1] ] ]
      */

      //Se dal body volessimo aggiungere un altro layer a mano nelle coordinate (altro strato di coppia di quadre), si potrebbe togliere questo wrap ma per semplicità si è deciso di fare il "cast" internamente
      const coordinatesGeoJson: Position[][] = [coordinates];
      
      console.log("Creazione nuova area");
      // Creazione della nuova area.
      const geoJsonArea: GeofenceareaCreationData = {
        name: name,
        area: {
          type: 'Polygon',
          coordinates: coordinatesGeoJson,
        },
        max_speed: max_speed ? max_speed : null, 
      };
      console.log(geoJsonArea);
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

  public updateArea = async (req: Request, res: Response, next: NextFunction) => {
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

  public deleteArea = async (req: Request, res: Response, next: NextFunction) => {
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