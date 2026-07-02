import { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import * as z from "zod";

export const userUpdateValidation = [validateUpdateBody];

// A differenza di AuthMiddleware.ts, qui non c'è bisogno di validare la presenza dei campi, perché l'utente può decidere di aggiornare solo alcuni campi. Quindi se un campo non è presente, non viene validato. Se invece è presente, viene validato secondo gli schemi definiti.

const emailSchema = z.email().max(255);
const passwordSchema = z.string().min(8).max(32).regex(/^(?=.*[A-Za-z])(?=.*\d)\S+$/);
const usernameSchema = z.string().min(4).max(50).regex(/^(?=.*[A-Za-z])[A-Za-z0-9]+$/);

// Rendiamo i campi opzionali, così non è necessaria la loro presenza
const updateBodySchema = z.object({
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
}).strict(); // strict() assicura che non ci siano campi extra non definiti nello schema

export function validateUpdateBody(req: Request, _res: Response, next: NextFunction) {
    const result = updateBodySchema.safeParse(req.body);
    
    if (!result.success) {
        const firstIssue = result.error.issues[0]!;
        const fieldName = firstIssue.path[0];

        if (firstIssue.code === "unrecognized_keys") {
            return next(ErrorFactory.getError(AppErrorEnum.INVALID_PARAMS));
        }

        if (firstIssue.code === "invalid_type") {
            switch (fieldName) {
                case "username":
                    return next(ErrorFactory.getError(AppErrorEnum.MISSING_USERNAME));
                case "email":
                    return next(ErrorFactory.getError(AppErrorEnum.MISSING_EMAIL));
                case "password":
                    return next(ErrorFactory.getError(AppErrorEnum.MISSING_PASSWORD));
                default:
                    return next(ErrorFactory.getError(AppErrorEnum.MISSING_DATA));
            }
        }

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