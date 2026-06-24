import { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import { checkToken } from "./JWTMiddleware.js";
import { AdminService } from "../services/AdminService.js"

export const tokenValidation = [checkTokenAmount];
export const tokenBalanceCheck = [checkTokenBalance];
const adminService = new AdminService();

// Controllo valore token nella ricarica del saldo (admin).
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

async function checkTokenBalance(req: Request, res: Response, next: NextFunction){
  const jwtDecoded = checkToken(req);
  if(!jwtDecoded){
    throw ErrorFactory.getError(AppErrorEnum.JWT_TOKEN_INVALID);
  }
  const user = await adminService.getUtenteById(jwtDecoded.user_id);
  if(!user){
    throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
  }
  if(user.tokens < 0.025){
    throw ErrorFactory.getError(AppErrorEnum.INSUFFICIENT_TOKEN_BALANCE);
  }
  next();
}