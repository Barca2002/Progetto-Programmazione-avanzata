import { Request, Response, NextFunction } from 'express';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { hasMaxDecimals } from '../utils/DecimalChecker.js';
import { z } from 'zod';

export async function checkDatiInviati(req: Request, _res: Response, next: NextFunction){
    const result = datiInviatiSchema.safeParse(req.body);

    if (!result.success) {
        // Prendiamo il primo campo che ha fallito la validazione (path contiene il nome del campo/proprietà).
        const firstIssue = result.error.issues[0]!;
        const fieldName = firstIssue.path[0]; // Es: "username", "email", "password"

        // Se l'errore è dovuto a chiavi non permesse (es. inviate a causa di .strict())
        if (firstIssue.code === "unrecognized_keys") {
            return next(ErrorFactory.getError(AppErrorEnum.INVALID_PARAMS));
        }

        // Mappiamo gli errori 
        switch (fieldName) {
            case 'mmsi':
                throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI);
            case 'latitudine':
                throw ErrorFactory.getError(AppErrorEnum.INVALID_LATITUDINE);
            case 'longitudine':
                throw ErrorFactory.getError(AppErrorEnum.INVALID_LONGITUDINE);
            case 'velocita_kmh':
                throw ErrorFactory.getError(AppErrorEnum.INVALID_VELOCITA);
            case 'stato':
                throw ErrorFactory.getError(AppErrorEnum.INVALID_STATO);
            default:
                throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
        }
    }
    next();
}

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