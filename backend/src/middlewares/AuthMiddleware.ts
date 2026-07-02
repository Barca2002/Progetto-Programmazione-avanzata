import { NextFunction, Request, Response } from "express";
import { AppErrorEnum, AppErrorName } from "../utils/StatusMessages.js";
import * as z from "zod";
import { isMissingIssue } from "../utils/HelperFunctions.js";
import { validateBody } from "../utils/HelperFunctions.js";

export const MAX_EMAIL_LENGTH = 254;
/**
 * Definizione dello schema di validazione dell'email, della password e dell'username tramite Zod. 
 * I parametri della request devono essere solamente quelli in registerBodySchema.
 * L'email deve essere lunga al massimo MAX_EMAIL_LENGTH caratteri.
 * La password deve essere lunga tra 8 e 32 caratteri alfanumerici e deve comprendere almeno un numero. 
 * L'username deve essere lungo tra 4 e 50 caratteri, inoltre non ammette caratteri speciali.
 */

export const emailSchema = z.email().max(MAX_EMAIL_LENGTH);
const passwordSchema = z.string().min(8).max(32).regex(/^(?=.*[A-Za-z])(?=.*\d)\S+$/);
const usernameSchema = z.string().min(4).max(50).regex(/^(?=.*[A-Za-z])[A-Za-z0-9]+$/);

const registerBodySchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
}).strict(); 

const loginBodySchema = z.object({
    email: emailSchema,
    password: passwordSchema,
}).strict(); 

/**
 * Funzione per mappare gli errori dei campi della richiesta con gli errori definiti nell'enum.
 * DIstingue se il campo è mancante o se il formato è errato. 
 * @param campo stringa che rappresenta il campo del body della richiesta da validare. Si controlla se è mancante o di tipo errato/invalido.
 * @param issue oggetto di Zod che rappresenta il problema del campo. Permette di distinguere se è missing o di tipo errato/invalido.
 * @param reqBody oggetto che rappresenta il body della richiesta. Serve per vedere se il campo è mancante o di tipo errato.
 * @returns restituisce un errore di AppErrorEnum in base al campo, se è mancante o invalido.
 */

function mapErroriRegister(campo: string, issue: z.core.$ZodIssue, reqBody: any) {
    const missing = isMissingIssue(issue, reqBody);

    const map: Record<string, { missing: AppErrorName, invalid: AppErrorName }> = {
        username: {
            missing: AppErrorEnum.MISSING_USERNAME,
            invalid: AppErrorEnum.INVALID_USERNAME,
        },
        email: {
            missing: AppErrorEnum.MISSING_EMAIL,
            invalid: AppErrorEnum.INVALID_EMAIL,
        },
        password: {
            missing: AppErrorEnum.MISSING_PASSWORD,
            invalid: AppErrorEnum.INVALID_PASSWORD,
        }
    };

    const entry = map[campo];
    if (!entry){
        return AppErrorEnum.INCORRECT_DATA;
    }

    return missing ? entry.missing : entry.invalid;
}
/**
 * È uguale alla funzione precedente, soltanto che non bisogna validare il campo username, quindi ha un campo in meno.
 * @param campo stringa che rappresenta il campo del body della richiesta da validare. Si controlla se è mancante o di tipo errato/invalido.
 * @param issue oggetto di Zod che rappresenta il problema del campo. Permette di distinguere se è missing o di tipo errato/invalido.
 * @param reqBody oggetto che rappresenta il body della richiesta. Serve per vedere se il campo è mancante o di tipo errato.
 * @returns restituisce un errore di AppErrorEnum in base al campo, se è mancante o invalido.
 */

function mapErroriLogin(campo: string, issue: z.core.$ZodIssue, reqBody: any) {
    const missing = isMissingIssue(issue, reqBody);

    const map: Record<string, { missing: AppErrorName, invalid: AppErrorName }> = {
        email: {
            missing: AppErrorEnum.MISSING_EMAIL,
            invalid: AppErrorEnum.INVALID_EMAIL,
        },
        password: {
            missing: AppErrorEnum.MISSING_PASSWORD,
            invalid: AppErrorEnum.INVALID_PASSWORD,
        }
    };

    const entry = map[campo];
    if (!entry){
        return AppErrorEnum.INCORRECT_DATA;
    }

    return missing ? entry.missing : entry.invalid;
}

/**
 * Sfruttiamo l'helper function per effettuare la validazione di uno schema con 
 * una certa mappa di errori. 
 */

export function validateRegisterBody(req: Request, _res: Response, next: NextFunction) {
    validateBody(req.body, registerBodySchema, mapErroriRegister, next);
}

export function validateLoginBody(req: Request, _res: Response, next: NextFunction) {
    validateBody(req.body, loginBodySchema, mapErroriLogin, next);
}