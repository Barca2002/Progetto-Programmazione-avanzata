import { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import * as z from "zod";

// Queste costanti definiscono la pipeline di validazione per le rotte di login e registrazione. Esse specificano la catena di funzioni di validazione devono essere eseguite prima di raggiungere il controller effettivo.
export const loginValidationPipeline = [checkEmail, checkPassword];
export const registerValidationPipeline = [checkUsername, checkEmail, checkPassword];

// Definizione dello schema di validazione dell'email, della password e dell'username tramite Zod. L'email deve essere lunga al massimo 255 caratteri. 
// La password deve essere lunga tra 8 e 32 caratteri alfanumerici e deve comprendere almeno un numero. 
// L'username deve essere lungo tra 4 e 50 caratteri, inoltre non ammette caratteri speciali.
const emailSchema = z.email().max(255);
const passwordSchema = z.string().min(8).max(32).regex(/^(?=.*[A-Za-z])(?=.*\d)\S+$/);
const usernameSchema = z.string().min(4).max(50).regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]+$/);

// Validazione username. Controlla se l'username è presente e segue lo schema definito con Zod.
function checkUsername(req: Request, _res: Response, next: NextFunction) {
    const username = req.body.username;
    
    if (!username || !usernameSchema.safeParse(username).success) {
        return next(ErrorFactory.getError(AppErrorEnum.INVALID_USERNAME));
    }
    next(); // Passa il controllo a checkEmail
}

// Validazione email. Controlla se l'email è presente e segue lo schema definito con Zod.
function checkEmail(req: Request, _res: Response, next: NextFunction) {
    const email = req.body.email;
    // Non serve controllare se è una stringa perché zod già lo fa
    if (!email || !emailSchema.safeParse(email).success) {
        return next(ErrorFactory.getError(AppErrorEnum.INVALID_EMAIL));
    }

    next(); // Passa il controllo a checkPassword().
}

// Validazione password. Controlla se la password è presente e segue lo schema definito con Zod.
function checkPassword(req: Request, _res: Response, next: NextFunction) {
    const password = req.body.password;
    
    if (!password || !passwordSchema.safeParse(password).success) {
        return next(ErrorFactory.getError(AppErrorEnum.INVALID_PASSWORD));
    }
    next(); // Passa il controllo alla funzione che ha chiamato la catena, in questo caso all'authController.
}




