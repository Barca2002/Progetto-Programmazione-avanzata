import { DatiInviatiService } from "../services/DatiInviatiService.js";
import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { AppError } from "../models/AppErrorModel.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { decodeJwt } from "../middlewares/JWTMiddleware.js";
import { ImbarcazioneService } from "../services/ImbarcazioneService.js";
import { ViolazioneService } from "../services/ViolazioneService.js";
import { SegnalazioneService } from "../services/SegnalazioneService.js";
import { TokenService } from "../services/TokenService.js";
import { LogSpostamentiService } from "../services/LogSpostamentiService.js";

export class UserController {
  public readonly datiinviatiService = new DatiInviatiService();
  public readonly imbarcazioneService = new ImbarcazioneService();
  public readonly violazioneService = new ViolazioneService();
  public readonly segnalazioneService = new SegnalazioneService();
  public readonly tokenService = new TokenService();

  public async sendData(req: Request, res: Response ){
    try {
      const data = req.body;
      // Prendiamo l'user_id dal token JWT per controllare se è il proprietario della barca.
      const authHeader = req.headers['authorization'];
      const token = authHeader!.split(' ')[1];
      const user_id = decodeJwt(token!).user_id;
      // Invio dei dati con i relativi controlli e logging dello spostamento
      await this.datiinviatiService.sendData(data, user_id!);
      // Scaliamo i token per la richiesta.
      await this.spendToken(user_id);
      // Controllo se generare una violazione ed eventualmente una segnalazione.
      await this.violazioneService.checkIfViolazione(data);
      await this.segnalazioneService.checkIfSegnalazione();
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.SEND_DATA, data));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async spendToken(user_id: number){
    await this.tokenService.spendToken(user_id);
    return true;
  }
}