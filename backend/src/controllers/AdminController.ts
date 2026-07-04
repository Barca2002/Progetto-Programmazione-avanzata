import { AdminService } from "../services/AdminService.js";
import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { AppError } from "../models/AppErrorModel.js";
import { ViolazioneService } from "../services/ViolazioneService.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { ImbarcazioneService } from "../services/ImbarcazioneService.js";
import { ImbarcazioneController } from "./ImbarcazioneController.js";
import { Position } from "geojson";
import { CreateGeofenceAreaBody, GeofenceareaCreationData } from "../models/GeofenceareaModel.js";
import { GeofenceAreaController } from "./GeofenceareaController.js";
import { ViolazioneCreationData } from "../models/ViolazioneModel.js";
import { UpdateTokenBody } from "../models/UserModel.js";
import { GetPositionsInDateRange, ImbarcazioneCreationData, LinkDataBody, UnlinkDataBody } from "../models/ImbarcazioneModel.js";

export class AdminController {
  private readonly adminService = new AdminService();
  private readonly violazioneService = new ViolazioneService();
  private readonly imbarcazioneService = new ImbarcazioneService();
  private readonly imbarcazioneController = new ImbarcazioneController();
  private readonly geofenceareaController = new GeofenceAreaController();

  /**
   * Funzione per aggiornare il credito di un utente tramite l'inserimento della sue e-mail e di quanto aggiornare il suo credito, restituendo il nuovo credito residuo
   * @param req oggetto che contiene il body della richiesta
   * @param res oggetto della risposta alla richiesta
   */
  public async updateTokenBalance(req: Request, res: Response) {
    try {
      const { email, newTokenAmount: tokenAmount } = req.body as UpdateTokenBody;
      const user = await this.adminService.findByEmail(email);
      res.json(await this.adminService.updateTokenBalance(email, Number(user.tokens) + tokenAmount));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  }

  /**
   * Funzione per visualizzare il credito residuo di un utente tramite il suo id inserito nei parametri della richiesta, restituendo l'utente, in caso tutti i controlli siano stati passati.
   * @param req oggetto che contiene il body della richiesta
   * @param res oggetto della risposta alla richiesta
   */
  public async getTokenBalance(req: Request, res: Response) {
    try {
      const utente = await this.adminService.getUtenteById(Number(req.params.id));
      const utente_data = { id: utente.user_id, email: utente.email, tokens: utente.tokens };
      SuccessFactory.getSuccess(AppSuccessEnum.GET_TOKEN_BALANCE_SUCCESS, utente_data).send(res);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  }

  /**
 * Funzione che restituisce lo stato di tutte le imbarcazioni associate a una specifica geofence area, identificata tramite l'id passato come parametro nella richiesta.
 * @param req oggetto che contiene il body della richiesta, in particolare l'id della geoarea nei parametri della route (geoareaid)
 * @param res oggetto della risposta alla richiesta
 */
  public async getAllImbarcazioniStatusByGeoarea(req: Request, res: Response) {
    try {
      const geoarea_id = Number(req.params.geoareaid);
      const imbarcazione_status = await this.imbarcazioneService.getAllImbarcazioniStatus(geoarea_id);
      SuccessFactory.getSuccess(AppSuccessEnum.STATUS_FOUND, imbarcazione_status).send(res);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  }

  public async createViolazione(req: Request, res: Response) {
    try {
      const data = req.body as ViolazioneCreationData;
      const result = await this.violazioneService.createViolazione(data);
      SuccessFactory.getSuccess(AppSuccessEnum.VIOLAZIONE_CREATED, result).send(res);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  }

  /**
   * Funzione per creare un'imbarcazione, prendendo i valori necessari per la creazione dal body: mmsi, name, type, descr, max_capacity e user_id, segnalando un errore in mancanza di uno di essi
   * @param req oggetto che contiene il body della richiesta
   * @param res oggetto della risposta alla richiesta
   */
  public async createImbarcazione(req: Request, res: Response) {
    try {
      const { mmsi, name, type, descr, max_capacity, user_id } = req.body as ImbarcazioneCreationData;
      if (!user_id || !mmsi || !name || !type || !descr || !max_capacity) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }
      const nuovaImbarcazione = await this.imbarcazioneController.createImbarcazione({ mmsi, name, type, descr, max_capacity, user_id });
      SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONE_CREATED, nuovaImbarcazione).send(res);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  };

  /**
   * Funzione che torna tutte le imbarcazioni con le segnalazioni
   * @param req oggetto che contiene il body della richiesta
   * @param res oggetto della risposta alla richiesta
   */
  public async getAllImbarcazioniWithSegnalazioni(req: Request, res: Response) {
    try {
      const imbarcazioni_segnalazioni = await this.imbarcazioneController.getAllImbarcazioniWithSegnalazioni();
      SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONI_SEGNALAZIONI_FOUND, imbarcazioni_segnalazioni).send(res);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  }

  /**
   * Funzione che prende dal body i link fra imbarcazioni e geoaree richieste e controlla che siano stati inseriti e che l'oggetto sia un array
   * @param req oggetto che contiene il body della richiesta
   * @param res oggetto della risposta alla richiesta
   */
  public async linkGeoareasToImbarcazioni(req: Request, res: Response): Promise<void> {
    try {
      const links = req.body as LinkDataBody[];

      if (!links || !Array.isArray(links)) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }
      await this.imbarcazioneController.linkGeoareasToImbarcazioni(links);
      SuccessFactory.getSuccess(AppSuccessEnum.GEOAREAS_LINKED, links).send(res);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  }

  /**
   * Funzione che dissocia una geoarea da un'imbarcazione, controllando se l'mmsi e l'id della geofence area esistano
   * @param req oggetto che contiene il body della richiesta
   * @param res oggetto della risposta alla richiesta
   */
  public async unlinkGeoareaFromImbarcazione(req: Request, res: Response): Promise<void> {
    try {
      const { mmsi, geoarea_id } = req.body as UnlinkDataBody;

      if (!mmsi || !geoarea_id) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }
      const unlink: UnlinkDataBody = { mmsi: mmsi, geoarea_id: geoarea_id }
      await this.imbarcazioneController.unlinkGeoareaToImbarcazioni(unlink);
      SuccessFactory.getSuccess(AppSuccessEnum.AREA_DELETED, unlink).send(res);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  }

  /**
   * Funzione che ritorna tutte le posizioni di un'imbarcazione che sono comprese fra una data di inizio e una data di fine, che, se non inserita, si considera come data fine quando viene mandata la richiesta 
   * @param req oggetto che contiene il body della richiesta
   * @param res oggetto della risposta alla richiesta
   */
  public async getPositionsInDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { mmsi, start_date, end_date } = req.body as Partial<GetPositionsInDateRange>;
      if (!mmsi || !start_date) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }
      const data = { mmsi, start_date, end_date: end_date ?? new Date().toLocaleDateString("it-IT") };
      const posizioni = await this.imbarcazioneController.getPointsAsGeoJson(data);
      SuccessFactory.getSuccess(AppSuccessEnum.POSIZIONI_FOUND, posizioni).send(res);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  }

  public async createGeofencearea(req: Request, res: Response) {
    try {
      const { features } = req.body as CreateGeofenceAreaBody;
      const name = features[0].properties.name;
      const coordinates = features[0].geometry.coordinates;
      const max_speed = features[0].properties.max_speed;
      if (!name || !coordinates) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }
      /*
      // Lo standard di geojson richiede prima la longituide e poi la latitudine, quindi coppie [long, lat], ...
      
      Inoltre, per definire un'area, richiede Position[][] (array di anelli, dove ogni anello è un array di punti):
      "coordinates": [ [ [125.6, 10.1], [124.6, 10.0], [124.0, 9.5], [125.6, 10.1] ] ]
      */
      const coordinatesGeoJson: Position[][] = coordinates;
      // Creazione della nuova area.
      const geoJsonArea: GeofenceareaCreationData = {
        name: name,
        area: {
          type: 'Polygon',
          coordinates: coordinatesGeoJson,
        },
        max_speed: max_speed ?? null,
      };

      const nuovaArea = await this.geofenceareaController.createArea(geoJsonArea);
      SuccessFactory.getSuccess(AppSuccessEnum.GEOAREA_CREATED, nuovaArea).send(res);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  };

  public async getAllImbarcazioniWithGeofenceareas(req: Request, res: Response): Promise<void> {
    try {
      const imbarcazioni = await this.imbarcazioneController.getAllImbarcazioniWithGeofenceareas();
      SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONI_GEOFENCES_FOUND, imbarcazioni).send(res);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
      }
    }
  };

}