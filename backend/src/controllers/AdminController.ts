import { AdminService } from "../services/AdminService.js";
import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { AppError } from "../models/AppErrorModel.js";
import { SegnalazioneService } from "../services/SegnalazioneService.js";
import { ViolazioneService } from "../services/ViolazioneService.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { ImbarcazioneService } from "../services/ImbarcazioneService.js";
import { ImbarcazioneController } from "./ImbarcazioneController.js";
import { Position } from "geojson";
import { GeofenceareaCreationData } from "../models/GeofenceareaModel.js";
import { GeofenceAreaController } from "./GeofenceareaController.js";

export interface GeoAreaLinkData {
  mmsi: number;
  geoarea_ids: number[];
}

export interface PointsAsGeoJsonData {
  mmsi: number;
  start_date: string;
  end_date: string;
}

export class AdminController {
  private readonly adminService = new AdminService();
  private readonly segnalazioneService = new SegnalazioneService();
  private readonly violazioneService = new ViolazioneService();
  private readonly imbarcazioneService = new ImbarcazioneService();
  private readonly imbarcazioneController = new ImbarcazioneController();
  private readonly geofenceareaController = new GeofenceAreaController();
  

  public async getUsers(_req: Request, res: Response) {
    try {
      const utenti = await this.adminService.getUtenti();
      // Togliamo la password, il parametro plain: true rimuove tutti i metadati inutili di Sequelize.
      const sanitizedUser = utenti.map(user => {
        const { password: _password, ...rest } = user.get({ plain: true });
        return rest;
    });
    res.json(sanitizedUser);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async getUserById(req: Request, res: Response ){
    try {
      const id = Number(req.params.id);
      const responseData = await this.adminService.getUtenteById(id);
      // Ritorno le informazioni dell'utente togliendo info sensibili come la password
      const { username, email, is_admin, tokens } = responseData;
      res.json({username, email, is_admin, tokens});
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async updateUser(req: Request, res: Response ){
    try {
      const id = Number(req.params.id);
      const utenteAggiornato = (await this.adminService.updateUtente(id, req.body)).get({ plain: true });
      const { password, ...utenteAggiornatoFiltered } = utenteAggiornato;
      res.json(utenteAggiornatoFiltered);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async deleteUser(req: Request, res: Response ){
    try {
      const id = Number(req.params.id);
      const result = await this.adminService.deleteUtente(id);
      res.json(result);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async updateTokenBalance(req: Request, res: Response){
    try{
    const tokenAmount = req.body?.newTokenAmount;
    const email = req.body?.email;
    const user = await this.adminService.findByEmail(email);
    res.json(await this.adminService.updateTokenBalance(email, Number(user.tokens) + tokenAmount));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async getTokenBalance(req: Request, res: Response){
    try{
    const utente = await this.adminService.getUtenteById(Number(req.params.id));

    res.json({id: utente.user_id, email: utente.email, tokens: utente.tokens});
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async getSegnalazioniByGeoarea(req: Request, res: Response){
    try {
      const geoarea_id = Number(req.params.geoarea_id);
      const segnalazioni = await this.segnalazioneService.getSegnalazioniByGeoarea(geoarea_id);
      res.json(segnalazioni);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async getViolazioniByMmsi(req: Request, res: Response){
    // L'mmsi va castato in number per lavorarci con le altre funzioni
    try {
      const mmsi = Number(req.params.mmsi);
      const violazioni = await this.violazioneService.getViolazioniByMmsi(mmsi);
      res.json(violazioni);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async getViolazioniByGeoarea(req: Request, res: Response){
    try {
      const geoarea_id = Number(req.params.geoarea_id);
      const violazioni = await this.violazioneService.getViolazioniByGeoarea(geoarea_id);
      res.json(violazioni);
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async getAllImbarcazioniStatusPerGeoarea(req: Request, res: Response){
    try {
        const geoarea_id  = Number(req.params.geoarea_id);
        const imbarcazione_status = await this.imbarcazioneService.getAllImbarcazioniStatus(geoarea_id)
        res.json(SuccessFactory.getSuccess(AppSuccessEnum.STATUS_FOUND, imbarcazione_status));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async createViolazione(req: Request, res: Response){
    try{
      const data = req.body;
      const result = await this.violazioneService.createViolazione(data);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.VIOLAZIONE_CREATED, result));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async createImbarcazione(req: Request, res: Response) {
    try {
      const {user_id, mmsi, name, type } = req.body;

      if (!user_id || !mmsi || !name || !type) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }

      const nuovaImbarcazione = await this.imbarcazioneController.createImbarcazione(req.body);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONE_CREATED, nuovaImbarcazione));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async getAllImbarcazioniWithSegnalazioni(req: Request, res: Response){
    try{
    const imbarcazioni_segnalazioni = await this.imbarcazioneController.getAllImbarcazioniWithSegnalazioni();
    res.json(SuccessFactory.getSuccess(AppSuccessEnum.IMBARCAZIONI_SEGNALAZIONI_FOUND, imbarcazioni_segnalazioni));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async linkGeoareasToImbarcazioni(req: Request, res: Response): Promise<void>{
    try {
      const links: GeoAreaLinkData[] = req.body;

      if (!links || !Array.isArray(links)) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }
      await this.imbarcazioneController.linkGeoareasToImbarcazioni(links);
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.GEOAREAS_LINKED, links));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async getPointsAsGeoJson(req: Request, res: Response): Promise<void> {
    try {
      const { mmsi, start_date } = req.body;
      if (!mmsi || !start_date) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
      }
      // Se si inserisce la data di fine si usa quella, altrimenti prendo la data al momento della richiesta
      const end_date = req.body.end_date ? req.body.end_date : new Date().toLocaleDateString('it-IT');

      const data: PointsAsGeoJsonData = {mmsi, start_date, end_date};

      const posizioni = await this.imbarcazioneController.getPointsAsGeoJson(data);

      res.json(SuccessFactory.getSuccess(AppSuccessEnum.POSIZIONI_FOUND, posizioni));
    } catch (err) {
      if (err instanceof AppError) {
        err.send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async createGeofencearea(req: Request, res: Response ){
      try {
        const name = req.body.features[0].properties.name;
        const coordinates = req.body.features[0].geometry.coordinates;
        const max_speed = req.body.features[0].properties.max_speed;
        if (!name || !coordinates){
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
        res.json(SuccessFactory.getSuccess(AppSuccessEnum.GEOAREA_CREATED, nuovaArea));
      } catch (err) {
        if (err instanceof AppError) {
          err.send(res);
        } else {
          console.log(err);
          res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
        }
      }
    };
  
}