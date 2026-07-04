import { NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppErrorName } from "./StatusMessages.js";
import * as z from "zod";

export function isMissingIssue(issue: z.core.$ZodIssue, reqBody: any) {
    const campo = issue.path[0];
    if (!campo) {
        throw ErrorFactory.getError(AppErrorEnum.VALIDATION_ERROR);
    }
    return reqBody[campo] === undefined;
}

export function isMissingIssueGeoJSON(issue: z.core.$ZodIssue, reqBody: any) {
    const path = issue.path;
    
    if (!path || path.length === 0) {
        throw ErrorFactory.getError(AppErrorEnum.VALIDATION_ERROR);
    }

    let current = reqBody;

    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i]!; 
        
        if (current === undefined || current === null) {
            return true;
        }
        current = current[key];
    }

    if (current === undefined || current === null) {
        return true;
    }

    const lastKey = path.at(-1)!;
    return current[lastKey] === undefined;
}

/**
 * ErrorMapper è un tipo che rappresenta una funzione che prende campo, issue e body, restituendo un errore custom AppErrorName. Permette di prendere le mappe di errori definite nei vari middleware.
 */
type ErrorMapper = (campo: string, issue: z.core.$ZodIssue, body: any) => AppErrorName;

/**
 * Funzione helper che esegue la validazione del body di una richiesta su uno schema ed una mappa di errori.
 * @param body 
 * @param schema 
 * @param errorMapper 
 * @param next 
 * @returns 
 */
export function validateBody(body: any, schema: z.ZodSchema, errorMapper: ErrorMapper, next: NextFunction) {
    const result = schema.safeParse(body);
    
    if (result.success) {
        next();
        return;
    }

    const issue = result.error.issues[0];

    if (!issue) {
        next(ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA));
        return;
    }

    const campo = issue.path[0] as string | undefined;
    if (!campo) {
        next(ErrorFactory.getError(AppErrorEnum.INVALID_PARAMS));
        return;
    }
    const errorEnum = errorMapper(campo, issue, body);
    next(ErrorFactory.getError(errorEnum));
}
