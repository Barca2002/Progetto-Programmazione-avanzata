import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppErrorEnum, AppErrorName } from '../utils/StatusMessages.js';
import { isMissingIssue, validateBody } from '../utils/HelperFunctions.js';
import { mmsiSchema } from './ImbarcazioniMiddleware.js';
const dateFormatRegex = /^\d{2}[-/]\d{2}[-/]\d{4}$/;

/**
 * Definizione dello schema di validazione per la richiesta delle posizioni in una finestra temporale. Si controlla se la data fornita è valida e non eccede il giorno corrente.
 */
const getPositionsSchema = z.object({
    mmsi: mmsiSchema,
    start_date: z.string().regex(dateFormatRegex),
    end_date: z.string().regex(dateFormatRegex).superRefine((value, ctx) => {
        const parsedDate = new Date(value.split(/[-/]/).reverse().join('-'));
        const oggi = new Date();

        if (Number.isNaN(parsedDate.getTime())) {
            ctx.addIssue({
                code: "custom",
                message: "INVALID_DATE",
            });
            return;
        }

        if (parsedDate >= oggi) {
            ctx.addIssue({
                code: "custom",
                message: "MAX_END_DATE",
            });
        }
    }
    ).optional()
}).strict();

/**
 * Funzione per mappare gli errori dei campi della richiesta con gli errori definiti nell'enum. Distingue se il campo è mancante o se il formato è errato. 
 * @param campo stringa che rappresenta il campo del body della richiesta da validare.
 * @param issue oggetto di Zod che rappresenta il problema del campo. Permette di distinguere se è missing o di tipo errato/invalido.
 * @param reqBody oggetto che rappresenta il body della richiesta. Serve per vedere se il campo è mancante o di tipo errato.
 * @returns restituisce un errore di AppErrorEnum in base al campo, se è mancante o invalido.
 */
function mapErroriDate(campo: string, issue: z.core.$ZodIssue, reqBody: any) {
    const missing = isMissingIssue(issue, reqBody);

    const map: Record<string, { missing: AppErrorName, invalid: AppErrorName }> = {
        start_date: {
            missing: AppErrorEnum.MISSING_START_DATE,
            invalid: AppErrorEnum.INVALID_START_DATE,
        },
        end_date: {
            missing: AppErrorEnum.MISSING_END_DATE,
            invalid: issue.message === "MAX_END_DATE" ? AppErrorEnum.MAX_END_DATE : AppErrorEnum.INVALID_END_DATE,
        },
    };

    const entry = map[campo];
    if (!entry) {
        return AppErrorEnum.INCORRECT_DATA;
    }

    return missing ? entry.missing : entry.invalid;
}
/**
 * Funzione che effettua la validazione delle date nella richiesta delle posizioni.
 * @param req oggetto che contiene il body della richiesta.
 * @param res oggetto che contiene la risposta alla richiesta.
 * @param next oggetto NextFunction che può essere utilizzato per chiamare un'altra funzione definita in una pipeline.
 */
export function validateDateFormat(req: Request, res: Response, next: NextFunction) {
    validateBody(req.body, getPositionsSchema, mapErroriDate, next)
}