import { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorNames } from "../utils/StatusMessages.js";

// Queste costanti definiscono la pipeline di validazione per le rotte di login e registrazione. Esse specificano la catena di funzioni di validazione devono essere eseguite prima di raggiungere il controller effettivo.
export const validateLogin = [checkEmail, checkPassword];
//export const validateRegister = [checkUsername, checkEmail, checkPassword];

// Funzione di validazione dell'email. Controlla se l'email è presente, è una stringa e rispetta un formato valido.
function checkEmail(req: Request, res: Response, next: NextFunction) {
    const email = req.body.email;
    // Questa regex controlla se l'email contiene almeno un carattere prima della chiocciola, un dominio e un TLD alla fine.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
        return next(ErrorFactory.getError(AppErrorNames.INVALID_EMAIL));
    }

    next(); // checkPassword()
}

// Funzione di validazione della password. Controlla se la password è presente, è una stringa e rispetta un formato valido. 
function checkPassword(req: Request, res: Response, next: NextFunction) {
    const password = req.body.password;
    // DA FARE!
}
