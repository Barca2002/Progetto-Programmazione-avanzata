import { NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppErrorName } from "./StatusMessages.js";
import * as z from "zod";

/**
 * Funzione che prende il campo che ha generato un errore dal path di un issue di Zod e controlla se l'errore è perché il campo manca.
 * @param issue oggetto di Zod che rappresenta un errore nella validazione.
 * @param reqBody body della richiesta.
 * @returns valore booleano.
 */
export function isMissingIssue(issue: z.core.$ZodIssue, reqBody: any) {
    const campo = issue.path[0];
    if (!campo) {
        throw ErrorFactory.getError(AppErrorEnum.VALIDATION_ERROR);
    }
    return reqBody[campo] === undefined;
}

/**
 * Funzione che prende il campo che ha generato un errore dal path di un issue di Zod e controlla se l'errore è perché il campo manca. Siccome questa funzione può prendere un path più lungo di 1, scorre i parametri del body in base al path e vede se sono nulli.
 * @param issue oggetto di Zod che rappresenta un errore nella validazione.
 * @param reqBody body della richiesta.
 * @returns valore booleano.
 */
export function isMissingIssueGeoJSON(issue: z.core.$ZodIssue, reqBody: any) {
    const path = issue.path;
    
    if (!path || path.length === 0) {
        throw ErrorFactory.getError(AppErrorEnum.VALIDATION_ERROR);
    }

    let currentParam = reqBody;

    for (let i = 0; i < path.length - 1; i++) {
        const attr = path[i]!; 
        
        if (currentParam === undefined || currentParam === null) {
            return true;
        }
        currentParam = currentParam[attr];
    }

    if (currentParam === undefined || currentParam === null) {
        return true;
    }

    const lastAttr = path.at(-1)!;
    return currentParam[lastAttr] === undefined;
}

/**
 * ErrorMapper è un tipo che rappresenta una funzione che prende come parametri campo di tipo string, issue di Zod e un body di una richiesta, restituendo un errore custom AppErrorName. Permette di prendere le mappe di errori definite nei vari middleware.
 */
type ErrorMapper = (campo: string, issue: z.core.$ZodIssue, body: any) => AppErrorName;

/**
 * Funzione helper che esegue la validazione del body di una richiesta su uno schema ed una mappa di errori. Se il path del campo che dà errore è nullo, vuol dire che è stato fornito un parametro aggiuntivo e genera l'errore INVALID_PARAMS.
 * @param body oggetto contenente il doby della richiesta.
 * @param schema oggetto ZodSchema che contiene lo schema per validare.
 * @param errorMapper tipo custom per prendere mappe di errori.
 * @param next oggetto NextFunction che può essere utilizzato per chiamare un'altra funzione definita in una pipeline.
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
