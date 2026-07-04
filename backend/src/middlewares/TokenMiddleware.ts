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

/**
 * Definizione dello schema di validazione della richiesta di ricarica del saldo dei token di un utente.
 */
const tokenUpdateSchema = z.object({
  newTokenAmount: z.number().min(MIN_TOKEN_BALANCE).max(MAX_RECHARGE),
  email: emailSchema,
}).strict();

/**
 * Funzione per mappare gli errori dei campi della richiesta con gli errori definiti nell'enum. Distingue se il campo è mancante o se il formato è errato. 
 * @param campo stringa che rappresenta il campo del body della richiesta da validare.
 * @param issue oggetto di Zod che rappresenta il problema del campo. Permette di distinguere se è missing o di tipo errato/invalido.
 * @param reqBody oggetto che rappresenta il body della richiesta. Serve per vedere se il campo è mancante o di tipo errato.
 * @returns restituisce un errore di AppErrorEnum in base al campo, se è mancante o invalido.
 */
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

/**
 * Funzione che effettua la validazione della richiesta ricarica del saldo dei token di un utente.
 * @param req oggetto che contiene il body della richiesta.
 * @param res oggetto che contiene la risposta alla richiesta.
 * @param next oggetto NextFunction che può essere utilizzato per chiamare un'altra funzione definita in una pipeline.
 */
export function validateTokenAmount(req: Request, res: Response, next: NextFunction) {
  validateBody(req.body, tokenUpdateSchema, mapErroriUpdateToken, next)
}

/**
 * Funzione che effettua il controllo del saldo dei token di un utente. Se l'utente ha meno di 0.025 token, non può effettuare la richiesta.
 * @param req oggetto che contiene il body della richiesta.
 * @param res oggetto che contiene la risposta alla richiesta.
 * @param next oggetto NextFunction che può essere utilizzato per chiamare un'altra funzione definita in una pipeline.
 */
export async function checkTokenBalance(req: Request, res: Response, next: NextFunction) {
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
