import { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import * as z from 'zod';

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

export function validateImbarcazioneCreationBody(req: Request, _res: Response, next: NextFunction) {
    const result = imbarcazioneCreationSchema.safeParse(req.body);
    
    if (!result.success) {
        const firstIssue = result.error.issues[0]!;
        const fieldName = firstIssue.path[0];

        if (firstIssue.code === "unrecognized_keys") {
            return next(ErrorFactory.getError(AppErrorEnum.INVALID_PARAMS));
        }

        if (firstIssue.code === "invalid_type") {
            switch (fieldName) {
                case "mmsi":
                    return next(ErrorFactory.getError(AppErrorEnum.MISSING_MMSI));
                case "name":
                    return next(ErrorFactory.getError(AppErrorEnum.MISSING_NAME));
                case "type":
                    return next(ErrorFactory.getError(AppErrorEnum.MISSING_TYPE));
                case "descr":
                    return next(ErrorFactory.getError(AppErrorEnum.MISSING_DESCR));
                case "max_capacity":
                    return next(ErrorFactory.getError(AppErrorEnum.MISSING_MAX_CAPACITY));
                case "user_id":
                    return next(ErrorFactory.getError(AppErrorEnum.MISSING_USER_ID));
                default:
                    return next(ErrorFactory.getError(AppErrorEnum.MISSING_DATA));
            }
        }

        switch (fieldName) {
            case "mmsi":
                return next(ErrorFactory.getError(AppErrorEnum.INVALID_MMSI));
            case "name":
                return next(ErrorFactory.getError(AppErrorEnum.INVALID_NAME));
            case "type":
                return next(ErrorFactory.getError(AppErrorEnum.INVALID_TYPE));
            case "descr":
                return next(ErrorFactory.getError(AppErrorEnum.INVALID_DESCR));
            case "max_capacity":
                return next(ErrorFactory.getError(AppErrorEnum.INVALID_MAX_CAPACITY));
            case "user_id":
                return next(ErrorFactory.getError(AppErrorEnum.INVALID_USERID));
            default:
                return next(ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA));
        }
    }
    next();
}

export async function checkMmsi(req: Request, _res: Response, next: NextFunction){
    const mmsi = req.params.mmsi ? req.params.mmsi : String(req.body.mmsi);
    if(!mmsi){
        throw ErrorFactory.getError(AppErrorEnum.MISSING_MMSI);
    }
    const result = mmsiSchema.safeParse(mmsi);
    if(!result.success){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI);
    }
    next();
}
