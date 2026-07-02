import { NextFunction } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppErrorName } from "./StatusMessages.js";
import * as z from "zod";

// Helper function per determinare se un parametro è mancante o di tipo errato durante le validazioni con Zod.
export function isMissingIssue(issue: z.core.$ZodIssue, reqBody: any) {
    const campo = issue.path[0];
    if (!campo) {
        throw ErrorFactory.getError(AppErrorEnum.VALIDATION_ERROR);
    }
    return reqBody[campo] === undefined;
}

// Zod restituisce un array con elementi che rappresentano il path del parametro mancante, quindi dobbiamo scorrerlo e vedere se i parametri in quel percorso sono nulli, quindi se non è presente.
export function isMissingIssueGeoJSON(issue: z.core.$ZodIssue, reqBody: any) {
    const path = issue.path;
    
    if (!path || path.length === 0) {
        throw ErrorFactory.getError(AppErrorEnum.VALIDATION_ERROR);
    }

    // Prendiamo il body della richiesta
    let current = reqBody;
    
    // Navighiamo fino al penultimo elemento del path, perché da esso accedo all'ultimo elemento figlio.
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i]!; // Man mano vado avanti nel path, quindi accedo agli altri elementi.
        
        // Se a metà strada troviamo un undefined o null, significa che il parametro che ci interessa manca sicuramente.
        if (current === undefined || current === null) {
            return true;
        }
        // Accediamo all'elemento figlio.
        current = current[key];
    }

    // Controllo finale sul target
    if (current === undefined || current === null) {
        return true;
    }

    // Accediamo all'elemento figlio dell'penultimo parametro.
    const lastKey = path[path.length - 1]!;
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
    // Se per qualche errore interno di zod esso restituisce un vettore di issues vuoto, l'app crasherebbe all'assegnazione della variabile campo.
    if (!issue) {
        next(ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA));
        return;
    }

    const campo = issue.path[0] as string | undefined;
    // Controllo dei campi extra. Se il path è vuoto, allora vuol dire che è un campo extra.
    if (!campo) {
        next(ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA));
        return;
    }
    // Chiama la mappa di errori per prendere l'errore giusto.
    const errorEnum = errorMapper(campo, issue, body);
    next(ErrorFactory.getError(errorEnum));
}
