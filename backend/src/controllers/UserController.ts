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
import { checkJWTtoken } from "../middlewares/JWTMiddleware.js";
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
   * Funzione che controlla se il token JWT è valido, poi effettua il controllo ed il salvataggio dei dati inviati. Successivamente scala i token per la richiesta e controlla se generare le violazioni. Infine, controlla se generare una segnalazione per la geofence area corrispondente ai dati inviati (se applicabile).
   * @param req oggetto contenente il body della richiesta con tutti i dati necessari come l'mmsi della barca, longitudine e latitudine, etc.
   * @param res oggetto che contiene la risposta alla richiesta.
   */
  public async sendStatus(req: Request, res: Response) {
    try {
      const data = req.body as DatiinviatiCreationData;
      const user_id = checkJWTtoken(req).user_id;
      
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

  /**
   * Funzione che restituisce lo stato delle proprie imbarcazioni in una certa geofence area, cioè se si trova dentro o fuori da essa. All'inizio si effettua il controllo del token e tramite esso si prende l'id dell'utente dal token JWT decodificato.
   * @param req oggetto che contiene il body della richiesta.
   * @param res oggetto che contiene la risposta alla richiesta.
   */
  public async getMyImbarcazioniStatus(req: Request, res: Response) {
    try {
      const user_id = checkJWTtoken(req).user_id;
      const geoarea_id = Number(req.params.geoarea_id);
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

  /**
   * Funzione che ritorna tutte le imbarcazioni dell'utente loggato e le segnalazioni che ha generato. Inoltre toglie alcuni campi come l'id utente dell'imbarcazione, l'id della segnalazione e l'id della geofence area associata.
   * @param req oggetto che contiene il body della richiesta.
   * @param res oggetto che contiene la risposta alla richiesta.
   */
  public async getMyImbarcazioniWithSegnalazioni(req: Request, res: Response) {
    try {
      const user_id = checkJWTtoken(req).user_id;
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

  /**
   * Funzione che retituisce il saldo dei token dell'utente loggato. L'id dell'utente viene preso dal token JWT.
   * @param req oggetto che contiene il body della richiesta.
   * @param res oggetto che contiene la risposta alla richiesta.
   */
  public async getMyTokenBalance(req: Request, res: Response) {
    const user_id = checkJWTtoken(req).user_id;
    const user = await this.adminService.getUtenteById(user_id);
    SuccessFactory.getSuccess(AppSuccessEnum.REQUEST_SUCCESS, { tokens: user.tokens }).send(res);
  }

  /**
   * Funzione che ritorna tutte le imbarcazioni dell'utente loggato e le geofence aree associate. Inoltre toglie alcuni campi come l'id dell'utente, della geofence area e dell'ultima violazione valida associata alla geoarea.
   * @param req oggetto che contiene il body della richiesta.
   * @param res oggetto che contiene la risposta alla richiesta.
   */
  public async getMyImbarcazioniWithGeofenceareas(req: Request, res: Response) {
    try {
      const user_id = checkJWTtoken(req).user_id;
      const imbarcazioni = await this.imbarcazioneController.getUserImbarcazioniWithGeofenceareas(user_id);
  
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