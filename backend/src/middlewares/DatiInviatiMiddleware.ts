import { Request, Response, NextFunction } from 'express';
import { AppErrorEnum, AppErrorName } from '../utils/StatusMessages.js';
import { hasMaxDecimals } from '../utils/DecimalChecker.js';
import { z } from 'zod';
import { isMissingIssue, validateBody } from '../utils/HelperFunctions.js';

/**
 * Definizione dello schema di validazione della richiesta d'invio dei dati di posizione.
 */
export const datiInviatiSchema = z.object({
    mmsi: z.number()
        .int()
        .refine((val) => val.toString().length === 9),
    latitudine: z.number()
        .min(-90)
        .max(90)
        .refine(hasMaxDecimals),
    longitudine: z.number()
        .min(-180)
        .max(180)
        .refine(hasMaxDecimals),
    velocita_kmh: z.number().
        int()
        .positive()
        .max(200),
    stato: z.enum(['IN NAVIGAZIONE', 'IN PESCA', 'STAZIONARIO'])
}).strict();

/**
 * Funzione per mappare gli errori dei campi della richiesta con gli errori definiti nell'enum. Distingue se il campo è mancante o se il formato è errato. 
 * @param campo stringa che rappresenta il campo del body della richiesta da validare.
 * @param issue oggetto di Zod che rappresenta il problema del campo. Permette di distinguere se è missing o di tipo errato/invalido.
 * @param reqBody oggetto che rappresenta il body della richiesta. Serve per vedere se il campo è mancante o di tipo errato.
 * @returns restituisce un errore di AppErrorEnum in base al campo, se è mancante o invalido.
 */
function mapErroriDatiInviati(campo: string, issue: z.core.$ZodIssue, reqBody: any) {
    const missing = isMissingIssue(issue, reqBody);
    
    const map: Record<string, { missing: AppErrorName, invalid: AppErrorName }> = {
        mmsi: {
            missing: AppErrorEnum.MISSING_MMSI,
            invalid: AppErrorEnum.INVALID_MMSI,
        },
        longitudine: {
            missing: AppErrorEnum.MISSING_LONGITUDINE,
            invalid: issue.code === "custom" ? 
            AppErrorEnum.INVALID_LONGITUDINE_DECIMALS : AppErrorEnum.INVALID_LONGITUDINE,
        },
        latitudine: {
            missing: AppErrorEnum.MISSING_LATITUDINE,
            invalid: issue.code === "custom" ? 
            AppErrorEnum.INVALID_LATITUDINE_DECIMALS : AppErrorEnum.INVALID_LATITUDINE,
        },
        velocita_kmh: {
            missing: AppErrorEnum.MISSING_VELOCITA_KMH,
            invalid: AppErrorEnum.INVALID_VELOCITA,
        },
        stato: {
            missing: AppErrorEnum.MISSING_STATO,
            invalid: AppErrorEnum.INVALID_STATO,
        },
    };

    const entry = map[campo];
    if (!entry){
        return AppErrorEnum.INCORRECT_DATA;
    }

    return missing ? entry.missing : entry.invalid;
}

/**
 * Funzione che effettua la validazione della richiesta d'invio dei dati di posizione.
 * @param req oggetto che contiene il body della richiesta.
 * @param res oggetto che contiene la risposta alla richiesta.
 * @param next oggetto NextFunction che può essere utilizzato per chiamare un'altra funzione definita in una pipeline.
 */
export function checkDatiInviati(req: Request, res: Response, next: NextFunction) {
    validateBody(req.body, datiInviatiSchema, mapErroriDatiInviati, next)
}
