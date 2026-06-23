import { DatiInviatiService } from "../services/DatiInviatiService.js";
import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { AppError } from "../models/AppErrorModel.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";

export class UserController {
  public readonly datiinviatiService = new DatiInviatiService();

  public sendData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      await this.datiinviatiService.sendData(data);

      res.json(SuccessFactory.getSuccess(AppSuccessEnum.SEND_DATA, data));
    } catch (err) {
      if (err instanceof AppError) {
        (err as AppError).send(res);
      } else {
        res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
      }
    }
  };
}