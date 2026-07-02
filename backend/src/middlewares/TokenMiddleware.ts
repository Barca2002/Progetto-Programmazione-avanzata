import { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import { checkToken } from "./JWTMiddleware.js";
import { AdminService } from "../services/AdminService.js"
import { emailSchema } from "./AuthMiddleware.js";
import * as z from "zod";

const adminService = new AdminService();

const MIN_TOKEN_BALANCE = 0.025;

const tokenUpdateSchema = z.object({
  newTokenAmount: z.number().min(MIN_TOKEN_BALANCE).max(100),
  email: emailSchema,
}).strict();

// Controllo valore token nella ricarica del saldo (rotta admin). Usata solo internamente.
export function validateTokenAmount(req: Request, _res: Response, next: NextFunction) {
  const result = tokenUpdateSchema.safeParse(req.body);
  if (!result.success) {
    const firstIssue = result.error.issues[0]!;
    const fieldName = firstIssue.path[0];

    // Se l'errore è dovuto a chiavi non permesse (cioè parametri che non sono nello schema, è generato da .strict()), lancio l'errore INVALID_PARAMS.
    if (firstIssue.code === "unrecognized_keys") {
      return next(ErrorFactory.getError(AppErrorEnum.INVALID_PARAMS));
    }

    // Mapping errori per parametri mancanti. Se mancano i parametri, zod riceve come tipo undefined, quindi l'errore sarà invalid_type.
    if (firstIssue.code === "invalid_type") {
      switch (fieldName) {
        case "email":
          return next(ErrorFactory.getError(AppErrorEnum.MISSING_EMAIL));
        case "newTokenAmount":
          return next(ErrorFactory.getError(AppErrorEnum.MISSING_NEW_TOKEN_AMOUNT));
        default:
          return next(ErrorFactory.getError(AppErrorEnum.MISSING_DATA));
      }
    }

    switch (fieldName) {
        case "email":
          return next(ErrorFactory.getError(AppErrorEnum.INVALID_EMAIL));
        case "newTokenAmount":
          return next(ErrorFactory.getError(AppErrorEnum.INVALID_NEW_TOKEN_AMOUNT));
        default:
          return next(ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA));
      }
  }
  next();
}

export async function checkTokenBalance(req: Request, res: Response, next: NextFunction) {
  const jwtDecoded = checkToken(req);
  if (!jwtDecoded) {
    throw ErrorFactory.getError(AppErrorEnum.JWT_TOKEN_INVALID);
  }
  const user = await adminService.getUtenteById(jwtDecoded.user_id);
  if (!user) {
    throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
  }
  if (user.tokens < MIN_TOKEN_BALANCE) {
    throw ErrorFactory.getError(AppErrorEnum.INSUFFICIENT_TOKEN_BALANCE);
  }
  next();
}