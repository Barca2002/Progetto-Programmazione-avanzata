import { AdminService } from "../services/AdminService.js";
import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { AppError } from "../models/AppErrorModel.js";
import { SegnalazioneService } from "../services/SegnalazioneService.js";
import { ViolazioneService } from "../services/ViolazioneService.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { ImbarcazioneService } from "../services/ImbarcazioneService.js";

export class AdminController {
  private readonly adminService = new AdminService();
  private readonly segnalazioneService = new SegnalazioneService();
  private readonly violazioneService = new ViolazioneService();
  private readonly imbarcazioneService = new ImbarcazioneService();
  

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

  
}