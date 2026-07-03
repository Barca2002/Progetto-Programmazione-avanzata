import { DatiInviatiService } from "../services/DatiInviatiService.js";
import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { AppError } from "../models/AppErrorModel.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { ImbarcazioneService } from "../services/ImbarcazioneService.js";
import { ViolazioneService } from "../services/ViolazioneService.js";
import { SegnalazioneService } from "../services/SegnalazioneService.js";
import { AdminService } from "../services/AdminService.js";
import { checkToken } from "../middlewares/JWTMiddleware.js";
import { ImbarcazioneController } from "./ImbarcazioneController.js";
import { DatiinviatiCreationData } from "../models/DatiInviatiModel.js";
import { REQ_COST } from "../utils/GlobalConstants.js";

export class UserController {
  private readonly datiinviatiService = new DatiInviatiService();
  private readonly imbarcazioneService = new ImbarcazioneService();
  private readonly violazioneService = new ViolazioneService();
  private readonly segnalazioneService = new SegnalazioneService();
  private readonly adminService = new AdminService();
  private readonly imbarcazioneController = new ImbarcazioneController();

  /**
   * Controlla se il token JWT è valido, poi effettua il controllo ed il salvataggio dei dati inviati. Successivamente scala i token per la richiesta e controlla se generare le violazioni. Infine, controlla se generare una segnalazione per la geofence area corrispondente ai dati inviati (se applicabile).
   * @param req oggetto contenente il body della richiesta con tutti i dati necessari come l'mmsi della barca, longitudine e latitudine, etc.
   * @param res oggetto AppSuccess con i dati inviati dall'utente.
   */
  public async sendStatus(req: Request, res: Response) {
    try {
      const data = req.body as DatiinviatiCreationData;
      const user_id = checkToken(req).user_id;
      
      await this.datiinviatiService.sendData(data, user_id);
      await this.spendToken(user_id);
      await this.violazioneService.checkIfViolazione(data);
      await this.segnalazioneService.checkIfSegnalazione(data);
      SuccessFactory.getSuccess(AppSuccessEnum.SEND_STATUS_OK, data).send(res);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  };

  public async spendToken(user_id: number) {
    const user = await this.adminService.getUtenteById(user_id);
    await this.adminService.updateTokenBalance(user.email, user.tokens - REQ_COST);
    return true;
  }

  public async getMyImbarcazioniStatus(req: Request, res: Response) {
    try {
      const user_id = checkToken(req).user_id;
      const geoarea_id = Number(req.params.geoarea_id);
      //console.log(geoarea_id, Number.isInteger(geoarea_id));
      const my_imbarcazioni_status = await this.imbarcazioneService.getMyImbarcazioniStatus(user_id, geoarea_id);
      SuccessFactory.getSuccess(AppSuccessEnum.REQUEST_SUCCESS, my_imbarcazioni_status).send(res);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  }


  public async getMyImbarcazioniWithSegnalazioni(req: Request, res: Response) {
    try {
      const user_id = checkToken(req).user_id;
      const my_imbarcazioni_segnalazioni = await this.imbarcazioneController.getUserImbarcazioniWithSegnalazioni(user_id);
      const myImbarcazioniSegnalazioniFiltered = my_imbarcazioni_segnalazioni.map(item => ({
        ...item,
        imbarcazione: (({ user_id, ...rest }) => rest)(item.imbarcazione.toJSON()),
        segnalazioni: item.segnalazioni.map(s => {const { id, geoarea_id, ...rest } = s.toJSON(); return rest})
      }));
      SuccessFactory.getSuccess(AppSuccessEnum.REQUEST_SUCCESS, myImbarcazioniSegnalazioniFiltered).send(res);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  }

  // Funzione usata dalla rotta utente per ritornare il saldo dei token dell'utente loggato.
  public async getMyTokenBalance(req: Request, res: Response) {
    const token = checkToken(req);
    const user_id = token.user_id;
    const user = await this.adminService.getUtenteById(user_id);
    SuccessFactory.getSuccess(AppSuccessEnum.REQUEST_SUCCESS, { tokens: user.tokens }).send(res);
  }

  // Funzione usata dalla rotta utente per ritornare se tutte le imbarcazioni dell'utente loggato sono nella geoarea inserita nella richiesta.
  public async getMyImbarcazioniWithGeofenceareas(req: Request, res: Response) {
    try {
      const user_id = checkToken(req).user_id;
      const imbarcazioni = await this.imbarcazioneController.getUserImbarcazioniWithGeofenceareas(user_id);
      // Togliamo il campo ultima_violazione_valida_id, user_id e geoarea_id
      const imbarcazioniFiltered = imbarcazioni.map(item => ({
        ...item,
        imbarcazione: (({ user_id, ...rest }) => rest)(item.imbarcazione),
        geofenceareas: item.geofenceareas.map(
          ({ geoarea_id, ultima_violazione_valida_id, ...rest }) => rest
        )
      }));
      SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONI_GEOFENCES_FOUND, imbarcazioniFiltered).send(res);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  }
}