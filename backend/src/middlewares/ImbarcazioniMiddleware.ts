import { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppErrorName } from "../utils/StatusMessages.js";
import * as z from 'zod';
import { isMissingIssue, validateBody } from "../utils/HelperFunctions.js";

// Per controllare che l'mmsi sia un numero a 9 cifre, imponiamo che deve essere in questo intervallo.
const mmsiSchema = z.number().min(100000000).max(999999999);
const nameSchema = z.string().max(100);
const typeSchema = z.string().max(50);
const descrSchema = z.string().max(500);
const maxCapacitySchema = z.number().int().max(1000);
const userIdSchema = z.number().int().positive();

const imbarcazioneCreationSchema = z.object({
    mmsi: mmsiSchema,
    name: nameSchema,
    type: typeSchema,
    descr: descrSchema,
    max_capacity: maxCapacitySchema,
    user_id: userIdSchema
}).strict();

function mapErroriCreazioneImbarcazione(campo: string, issue: z.core.$ZodIssue, reqBody: any) {
    const missing = isMissingIssue(issue, reqBody);

    const map: Record<string, { missing: AppErrorName, invalid: AppErrorName }> = {
        mmsi: {
            missing: AppErrorEnum.MISSING_MMSI,
            invalid: AppErrorEnum.INVALID_MMSI,
        },
        name: {
            missing: AppErrorEnum.MISSING_NAME,
            invalid: AppErrorEnum.INVALID_NAME,
        },
        type: {
            missing: AppErrorEnum.MISSING_TYPE_IMBARCAZIONE,
            invalid: AppErrorEnum.INVALID_TYPE,
        },
        descr: {
            missing: AppErrorEnum.MISSING_DESCR,
            invalid: AppErrorEnum.INVALID_DESCR,
        },
        max_capacity: {
            missing: AppErrorEnum.MISSING_MAX_CAPACITY,
            invalid: AppErrorEnum.INVALID_MAX_CAPACITY,
        },
        user_id: {
            missing: AppErrorEnum.MISSING_USER_ID,
            invalid: AppErrorEnum.INVALID_USERID,
        },
    };

    const entry = map[campo];
    if (!entry){
        return AppErrorEnum.INCORRECT_DATA;
    }

    return missing ? entry.missing : entry.invalid;
}

export function validateImbarcazioneCreationBody(req: Request, _res: Response, next: NextFunction) {
    validateBody(req.body, imbarcazioneCreationSchema, mapErroriCreazioneImbarcazione, next);
}

// Usata da altre funzioni
export async function checkMmsi(req: Request, _res: Response, next: NextFunction) {
    const mmsi = req.params.mmsi ? req.params.mmsi : String(req.body.mmsi);
    if (!mmsi) {
        throw ErrorFactory.getError(AppErrorEnum.MISSING_MMSI);
    }
    const result = mmsiSchema.safeParse(mmsi);
    if (!result.success) {
        throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI);
    }
    next();
}
