import { DatiInviatiService } from "../services/DatiInviatiService.js";
import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { AppError } from "../models/AppErrorModel.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { decodeJwt } from "../middlewares/JWTMiddleware.js";
import { ImbarcazioneService } from "../services/ImbarcazioneService.js";
import { ViolazioneService } from "../services/ViolazioneService.js";
import { SegnalazioneService } from "../services/SegnalazioneService.js";
import AdminService from "../services/AdminService.js";

export class UserController {
  public readonly datiinviatiService = new DatiInviatiService();
  public readonly imbarcazioneService = new ImbarcazioneService();
  public readonly violazioneService = new ViolazioneService();
  public readonly segnalazioneService = new SegnalazioneService();
  public readonly adminService = new AdminService();


  public async sendData(req: Request, res: Response) {
    try {
      const data = req.body;
      // Prendiamo l'user_id dal token JWT per controllare se è il proprietario della barca.
      const authHeader = req.headers['authorization'];
      const token = authHeader!.split(' ')[1];
      const user_id = decodeJwt(token!).user_id;
      // Invio dei dati con i relativi controlli e logging dello spostamento
      await this.datiinviatiService.sendData(data, user_id);
      // Scaliamo i token per la richiesta.
      await this.spendToken(user_id);
      // Controllo se generare una violazione ed eventualmente una segnalazione
      // INSERIRE CONTROLLO CHE, IN CASO DI DOPPIA VIOLAZIONE, CONTARNE SOLO UNA
      await this.violazioneService.checkIfViolazione(data);
      await this.segnalazioneService.checkIfSegnalazione(data);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.SEND_DATA, data));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async spendToken(user_id: number) {
    const user = await this.adminService.getUtenteById(user_id);
    await this.adminService.updateTokenBalance(user.email, user.tokens - 0.025);
    return true;
  }

  public async myImbarcazioniStatus(req: Request, res: Response) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader!.split(' ')[1];
      const user_id = decodeJwt(token!).user_id;
      const geoarea_id = req.body.geoarea_id;
      const my_imbarcazioni_status = await this.imbarcazioneService.getMyImbarcazioniStatus(user_id, geoarea_id);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.SEND_DATA, my_imbarcazioni_status));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }

  }
}