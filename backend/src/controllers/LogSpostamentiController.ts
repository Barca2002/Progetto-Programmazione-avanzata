import { LogSpostamentiService } from "../services/LogSpostamentiService.js";
import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { AppError } from "../models/AppErrorModel.js";

export class LogSpostamentiController {
  public readonly logSpostamentiService = new LogSpostamentiService();

  public async getAllImbarcazioniConSegnalazioni(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.logSpostamentiService.getAllImbarcazioniConSegnalazioni();
      res.json(SuccessFactory.getSuccess(AppSuccessEnum.LOG_SPOSTAMENTI_FOUND, result));
    } catch (err) {
        console.log(err);
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  }
}