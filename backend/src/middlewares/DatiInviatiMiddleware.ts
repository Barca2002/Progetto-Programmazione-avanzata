import { Request, Response, NextFunction } from 'express';
import { AppErrorEnum, AppErrorName } from '../utils/StatusMessages.js';
import { hasMaxDecimals } from '../utils/DecimalChecker.js';
import { z } from 'zod';
import { isMissingIssue, validateBody } from '../utils/HelperFunctions.js';

export const datiInviatiSchema = z.object({
    // L'mmsi deve essere di 9 cifre
    mmsi: z.number()
        .int()
        .refine((val) => val.toString().length === 9),
    // La latitudine deve avere al massimo MAX_DECIMALS cifre dopo la virgola
    latitudine: z.number()
        .min(-90)
        .max(90)
        .refine(hasMaxDecimals),
    // Stessa cosa per la longitudine
    longitudine: z.number()
        .min(-180)
        .max(180)
        .refine(hasMaxDecimals),
    // Il limite massimo di velocità registrabile è di 200 km/h. Deve essere un numero intero positivo. Siccome javascript non distingue tra, per esempio, 10 e 10.0, tecnicamente si possono mettere tanti 0 dopo la virgola, ma il numero sarà comunque considerato intero.
    velocita_kmh: z.number().
        int()
        .positive()
        .max(200),
    stato: z.enum(['IN NAVIGAZIONE', 'IN PESCA', 'STAZIONARIO'])
}).strict(); // Modalità strict, altrimenti si possono aggiungere campi a piacere

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

export function checkDatiInviati(req: Request, res: Response, next: NextFunction) {
    validateBody(req.body, datiInviatiSchema, mapErroriDatiInviati, next)
}
