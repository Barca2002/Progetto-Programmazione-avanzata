import { DatiInviatiService } from "../services/DatiInviatiService.js";
import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { AppError } from "../models/AppErrorModel.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { decodeJwt } from "../middlewares/JWTMiddleware.js";
import { ImbarcazioneService } from "../services/ImbarcazioneService.js";

export class UserController {
  public readonly datiinviatiService = new DatiInviatiService();
  public readonly imbarcazioneService = new ImbarcazioneService();

  public async sendData(req: Request, res: Response ){
    try {
      const data = req.body;
      // Prendiamo l'user_id dal token JWT per controllare se è il proprietario della barca.
      const authHeader = req.headers['authorization'];
      const token = authHeader!.split(' ')[1];
      const user_id = decodeJwt(token!).user_id;
      // invio dei dati
      await this.datiinviatiService.sendData(data, user_id!);

      res.json(SuccessFactory.getSuccess(AppSuccessEnum.SEND_DATA, data));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };
}