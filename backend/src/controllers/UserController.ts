import { DatiInviatiService } from "../services/DatiInviatiService.js";
import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { AppError } from "../models/AppErrorModel.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";

export class UserController {
  private datiinviatiService = new DatiInviatiService();

  public async sendData(req: Request, res: Response, next: NextFunction){
    try {
      const user_id = (req as any).userLoggato.user_id;
      const { mmsi, latitudine, longitudine, velocita_kmh, stato } = req.body;

      await this.datiinviatiService.sendData(user_id, mmsi, latitudine, longitudine, velocita_kmh, stato);

      res.json(SuccessFactory.getSuccess(AppSuccessEnum.SEND_DATA, {mmsi, latitudine, longitudine, velocita_kmh, stato}));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };
}