import { Request, Response, NextFunction } from 'express';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { hasMaxDecimals } from '../utils/DecimalChecker.js';
import { z } from 'zod';

export async function checkDatiInviati(req: Request, res: Response, next: NextFunction){
    const result = datiInviatiSchema.safeParse(req.body);

    if (!result.success) {
        // Prendiamo il primo campo che ha fallito la validazione (path contiene il nome del campo/proprietà).
        const firstError = result.error.issues[0]!.path[0];

        // Mappiamo l'errore 
        switch (firstError) {
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
    // Il limite massimo di velocità è di 200 km/h
    velocita_kmh: z.number()
        .min(0)
        .max(200)
        .refine(hasMaxDecimals),
    stato: z.enum(['IN NAVIGAZIONE', 'IN PESCA', 'STAZIONARIO'])
}).strict(); // Modalità strict, altrimenti si possono aggiungere campi a piacere