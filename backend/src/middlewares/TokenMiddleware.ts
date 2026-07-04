import { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppErrorName } from "../utils/StatusMessages.js";
import { checkJWTtoken } from "./JWTMiddleware.js";
import { AdminService } from "../services/AdminService.js"
import { emailSchema } from "./AuthMiddleware.js";
import * as z from "zod";
import { isMissingIssue, validateBody } from "../utils/HelperFunctions.js";

const adminService = new AdminService();

const MIN_TOKEN_BALANCE = 0.025;
const MAX_RECHARGE = 100;

const tokenUpdateSchema = z.object({
  newTokenAmount: z.number().min(MIN_TOKEN_BALANCE).max(MAX_RECHARGE),
  email: emailSchema,
}).strict();

function mapErroriUpdateToken(campo: string, issue: z.core.$ZodIssue, reqBody: any) {
    const missing = isMissingIssue(issue, reqBody);

    const map: Record<string, { missing: AppErrorName, invalid: AppErrorName }> = {
        newTokenAmount: {
            missing: AppErrorEnum.MISSING_NEW_TOKEN_AMOUNT,
            invalid: AppErrorEnum.INVALID_NEW_TOKEN_AMOUNT,
        },
        email: {
            missing: AppErrorEnum.MISSING_EMAIL,
            invalid: AppErrorEnum.INVALID_EMAIL,
        },
        
    };

    const entry = map[campo];
    if (!entry){
        return AppErrorEnum.INCORRECT_DATA;
    }

    return missing ? entry.missing : entry.invalid;
}

// Controllo valore token nella ricarica del saldo (rotta admin). Usata solo internamente.
export function validateTokenAmount(req: Request, res: Response, next: NextFunction) {
  validateBody(req.body, tokenUpdateSchema, mapErroriUpdateToken, next)
}

export async function checktokenBalance(req: Request, res: Response, next: NextFunction) {
  try {
    const jwtDecoded = checkJWTtoken(req);
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
  } catch (err) {
    next(err);
  }
}
