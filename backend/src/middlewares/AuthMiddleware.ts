import { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import * as z from "zod";

// Definizione dello schema di validazione dell'email, della password e dell'username tramite Zod. 
// I parametri della request devono essere solamente quelli in registerBodySchema
// L'email deve essere lunga al massimo 255 caratteri. 
// La password deve essere lunga tra 8 e 32 caratteri alfanumerici e deve comprendere almeno un numero. 
// L'username deve essere lungo tra 4 e 50 caratteri, inoltre non ammette caratteri speciali.
const emailSchema = z.email().max(255);
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


export function validateRegisterBody(req: Request, _res: Response, next: NextFunction) {
    const result = registerBodySchema.safeParse(req.body);
    
    if (!result.success) {
        // Prendiamo il primo errore riscontrato da Zod.
        const firstIssue = result.error.issues[0]!;
        const fieldName = firstIssue.path[0];

        // Se l'errore è dovuto a chiavi non permesse (cioè parametri che non sono nello schema, è generato da .strict()), lancio l'errore INVALID_PARAMS.
        if (firstIssue.code === "unrecognized_keys") {
            return next(ErrorFactory.getError(AppErrorEnum.INVALID_PARAMS));
        }

        // Mappiamo il nome del campo fallito sul rispettivo errore, passandolo all'errore handler successivo tramite next().
        switch (fieldName) {
            case "username":
                return next(ErrorFactory.getError(AppErrorEnum.INVALID_USERNAME));
            case "email":
                return next(ErrorFactory.getError(AppErrorEnum.INVALID_EMAIL));
            case "password":
                return next(ErrorFactory.getError(AppErrorEnum.INVALID_PASSWORD));
            default:
                return next(ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA));
        }
    }
    
    next();
}

export function validateLoginBody(req: Request, _res: Response, next: NextFunction) {
    const result = loginBodySchema.safeParse(req.body);
    
    if (!result.success) {
        // Prendiamo il primo errore riscontrato da Zod
        const firstIssue = result.error.issues[0]!;
        const fieldName = firstIssue.path[0];

        // Se l'errore è dovuto a chiavi non permesse (es. inviate a causa di .strict())
        if (firstIssue.code === "unrecognized_keys") {
            return next(ErrorFactory.getError(AppErrorEnum.INVALID_PARAMS));
        }

        // Mappiamo il nome del campo fallito sul rispettivo errore.
        switch (fieldName) {
            case "email":
                return next(ErrorFactory.getError(AppErrorEnum.INVALID_EMAIL));
            case "password":
                return next(ErrorFactory.getError(AppErrorEnum.INVALID_PASSWORD));
            default:
                return next(ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA));
        }
    }
    
    next();
}