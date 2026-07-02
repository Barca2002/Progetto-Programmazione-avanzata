import { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import { checkToken } from "./JWTMiddleware.js";
import { AdminService } from "../services/AdminService.js"
import z from "zod";

export const tokenValidation = [validateUpdateTokenAmount];
export const tokenBalanceCheck = [checkTokenBalance];
const adminService = new AdminService();

const updateTokenBalanceSchema = z.object({
  email: z.string(), //Mi basta sapere che sia una string, se non è una mail valida viene segnalato USER_NOT_FOUND
  newTokenAmount: z.number(),
}).strict();

const MIN_TOKEN_BALANCE = 0.025;
const MAX_RECHARGE = 100;

// Controllo valore token nella ricarica del saldo (rotta admin).
function validateUpdateTokenAmount(req: Request, _res: Response, next: NextFunction) {
  const result = updateTokenBalanceSchema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0]!;
    const fieldName = firstIssue.path[0];

    if (firstIssue.code === "unrecognized_keys") {
      return next(ErrorFactory.getError(AppErrorEnum.INVALID_PARAMS));
    }

    // Se mancano i parametri, zod riceve come tipo undefined, quindi l'errore sarà invalid:type.
    if (firstIssue.code === "invalid_type") {
      switch (fieldName) {
        case "newTokenAmount":
          return next(ErrorFactory.getError(AppErrorEnum.MISSING_TOKEN_AMOUNT));
        case "email":
          return next(ErrorFactory.getError(AppErrorEnum.MISSING_EMAIL));
        default:
          return next(ErrorFactory.getError(AppErrorEnum.MISSING_DATA));
      }
    }

    switch (fieldName) {
      case "newTokenAmount":
        return next(ErrorFactory.getError(AppErrorEnum.INVALID_TOKEN_AMOUNT));
      case "email":
        return next(ErrorFactory.getError(AppErrorEnum.INVALID_EMAIL));
      default:
        return next(ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA));
    }
  }

  const { newTokenAmount: tokenAmount } = result.data; //Cosi siamo sicuri che tokenAmount sia un numero intero positivo.

  //L'ultimo controllo da fare è sul valore di newTokenAmount.
  if(tokenAmount < MIN_TOKEN_BALANCE || tokenAmount > MAX_RECHARGE) {
      return next(ErrorFactory.getError(AppErrorEnum.INVALID_TOKEN_AMOUNT));
  }

  next();
}

async function checkTokenBalance(req: Request, _res: Response, next: NextFunction) {
  const jwtDecoded = checkToken(req);
  if (!jwtDecoded) {
    return next(ErrorFactory.getError(AppErrorEnum.JWT_TOKEN_INVALID));
  }
  const user = await adminService.getUtenteById(jwtDecoded.user_id);
  if (!user) {
    return next(ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND));
  }
  if (user.tokens < MIN_TOKEN_BALANCE) {
    return next(ErrorFactory.getError(AppErrorEnum.INSUFFICIENT_TOKEN_BALANCE));
  }
  next();
}