import { DatiInviatiService } from "../services/DatiInviatiService.js";
import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { AppError } from "../models/AppErrorModel.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { ImbarcazioneService } from "../services/ImbarcazioneService.js";
import { ViolazioneService } from "../services/ViolazioneService.js";
import { SegnalazioneService } from "../services/SegnalazioneService.js";
import { AdminService} from "../services/AdminService.js";
import { checkToken } from "../middlewares/JWTMiddleware.js";
import { ImbarcazioneController } from "./ImbarcazioneController.js";
import { DatiinviatiCreationData } from "../models/DatiInviatiModel.js";

export class UserController {
  private readonly datiinviatiService = new DatiInviatiService();
  private readonly imbarcazioneService = new ImbarcazioneService();
  private readonly violazioneService = new ViolazioneService();
  private readonly segnalazioneService = new SegnalazioneService();
  private readonly adminService = new AdminService();
  private readonly imbarcazioneController = new ImbarcazioneController();

  private readonly REQ_COST = 0.025;

  public async sendData(req: Request, res: Response) {
    try {
      const data = req.body as DatiinviatiCreationData;
      const user_id = checkToken(req).user_id;
      // Invio dei dati con i relativi controlli e logging dello spostamento
      await this.datiinviatiService.sendData(data, user_id);
      // Scaliamo i token per la richiesta.
      await this.spendToken(user_id);
      // Controllo se generare una violazione ed eventualmente una segnalazione
      await this.violazioneService.checkIfViolazione(data);
      await this.segnalazioneService.checkIfSegnalazione(data);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.SEND_STATUS_OK, data));
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
    await this.adminService.updateTokenBalance(user.email, user.tokens - this.REQ_COST);
    return true;
  }
  
  public async getMyImbarcazioniStatus(req: Request, res: Response) {
    try {
      const user_id = checkToken(req).user_id;
      const geoarea_id = Number(req.params.geoarea_id);
      //console.log(geoarea_id, Number.isInteger(geoarea_id));
      const my_imbarcazioni_status = await this.imbarcazioneService.getMyImbarcazioniStatus(user_id, geoarea_id);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.REQUEST_SUCCESS, my_imbarcazioni_status));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }


  public async getMyImbarcazioniWithSegnalazioni(req: Request, res: Response) {
    try {
      const user_id = checkToken(req).user_id;
      const my_imbarcazioni_segnalazioni = await this.imbarcazioneController.getUserImbarcazioniWithSegnalazioni(user_id);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.REQUEST_SUCCESS, my_imbarcazioni_segnalazioni));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

   // Funzione usata dalla rotta utente per ritornare il saldo dei token dell'utente loggato.
  public async getMyTokenBalance(req: Request, res: Response) {
      const token = checkToken(req);
      const user_id = token.user_id;
      const user = await this.adminService.getUtenteById(user_id);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.REQUEST_SUCCESS, {tokens: user.tokens}));
  }

  // Funzione usata dalla rotta utente per ritornare se tutte le imbarcazioni dell'utente loggato sono nella geoarea inserita nella richiesta.
  public async getMyImbarcazioniWithGeofenceareas(req: Request, res: Response){
    try{
    const user_id = checkToken(req).user_id;
    const imbarcazioni = await this.imbarcazioneController.getUserImbarcazioniWithGeofenceareas(user_id);
    res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONI_GEOFENCES_FOUND, imbarcazioni));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }
}