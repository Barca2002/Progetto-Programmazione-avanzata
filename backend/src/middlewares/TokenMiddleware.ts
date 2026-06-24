import { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";

export const tokenValidation = [checkTokenAmount]

function checkTokenAmount(req: Request, res: Response, next: NextFunction){
    const tokenAmount = req.body.newTokenAmount;
    if(!tokenAmount || isNaN(tokenAmount)){
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }
    if(tokenAmount < 0.025 || tokenAmount > 100) {
      throw ErrorFactory.getError(AppErrorEnum.INVALID_TOKEN_AMOUNT)
    }
    next();
}