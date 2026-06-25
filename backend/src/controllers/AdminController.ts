import { AdminService } from "../services/AdminService.js";
import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { AppError } from "../models/AppErrorModel.js";
import { ImbarcazioneService } from "../services/ImbarcazioneService.js";
import { SegnalazioneService } from "../services/SegnalazioneService.js";
import { ViolazioneService } from "../services/ViolazioneService.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";

export class AdminController {
  public readonly adminService = new AdminService();
  public readonly imbarcazioneService = new ImbarcazioneService();
  public readonly segnalazioneService = new SegnalazioneService();
  public readonly violazioneService = new ViolazioneService();
  

  public async getUtenti(req: Request, res: Response ){
    try {
      const utenti = await this.adminService.getUtenti();
      res.json(utenti);
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async getUtenteById(req: Request, res: Response ){
    try {
      const id = Number(req.params.id);
      const responseData = await this.adminService.getUtenteById(id);
      // Ritorno le informazioni dell'utente togliendo info sensibili come la password
      const { username, email, is_admin } = responseData;
      res.json({username, email, is_admin});
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async updateUtente(req: Request, res: Response ){
    try {
      const id = Number(req.params.id);
      const utenteAggiornato = await this.adminService.updateUtente(id, req.body);
      res.json(utenteAggiornato);
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async deleteUtente(req: Request, res: Response ){
    try {
      const id = Number(req.params.id);
      const result = await this.adminService.deleteUtente(id);
      res.json(result);
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };

  public async updateTokenBalance(req: Request, res: Response){
    try{
    const tokenAmount = req.body?.newTokenAmount;
    const email = req.body?.email;
    res.json(await this.adminService.updateTokenAmount(email, tokenAmount));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async getSegnalazioniByGeoarea(req: Request, res: Response){
    // L'mmsi va castato in number per lavorarci con le altre funzioni
    try {
      const geoarea_id = Number(req.params.geoarea_id);
      const segnalazioni = await this.segnalazioneService.getSegnalazioniByGeoarea(geoarea_id);
      res.json(segnalazioni);
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
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
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }

  public async getViolazioniByGeoarea(req: Request, res: Response){
    // L'mmsi va castato in number per lavorarci con le altre funzioni
    try {
      const geoarea_id = Number(req.params.geoarea_id);
      const violazioni = await this.violazioneService.getViolazioniByGeoarea(geoarea_id);
      res.json(violazioni);
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
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
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }

  }
}