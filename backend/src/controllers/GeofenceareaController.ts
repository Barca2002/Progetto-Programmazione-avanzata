import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import { AppError } from "../models/AppErrorModel.js";
import { GeofenceareaService } from "../services/GeofenceareaService.js";
import { GeofenceareaCreationData } from "../models/GeofenceareaModel.js";

export class GeofenceAreaController {
  public readonly geofenceareaService = new GeofenceareaService();

  public async getAree(req: Request, res: Response ){
    try {
      const aree = await this.geofenceareaService.getAree();
      res.json(aree);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  }

  public async getAreaById(req: Request, res: Response ){
    try {
      const id = Number(req.params.id);
      const area = await this.geofenceareaService.getAreaById(id);
      res.json(area);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  }

  public async createArea(data: GeofenceareaCreationData ){
      return await this.geofenceareaService.createArea(data);
  }

}