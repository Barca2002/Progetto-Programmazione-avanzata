import { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import * as z from 'zod';

export const imbarcazioneCreationValidation = [checkMmsi, checkName, checkType, checkDescr, checkMaxCapacity, checkUserId];
export const imbarcazioneUpdateValidation = [checkMmsi, checkNameOpt, checkTypeOpt, checkDescrOpt, checkMaxCapacityOpt, checkUserIdOpt];

const mmsiSchema = z.string().length(9).regex(/^\d+$/);
const nameSchema = z.string().max(100);
const typeSchema = z.string().max(50);
const descrSchema = z.string().max(500);
const maxCapacitySchema = z.number().int().max(1000);
const userIdSchema = z.number().int().positive();

// ---------------- CREATION (campi obbligatori) ----------------

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

export async function checkName(req: Request, _res: Response, next: NextFunction){
    const name = req.body.name;
    if(!name){
        throw ErrorFactory.getError(AppErrorEnum.MISSING_NAME);
    }
    const result = nameSchema.safeParse(name);
    if(!result.success){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_NAME);
    }
    next();
}

export async function checkType(req: Request, _res: Response, next: NextFunction){
    const type = req.body.type;
    if(!type){
        throw ErrorFactory.getError(AppErrorEnum.MISSING_TYPE);
    }
    const result = typeSchema.safeParse(type);
    if(!result.success){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_TYPE);
    }
    next();
}

export async function checkDescr(req: Request, _res: Response, next: NextFunction){
    const descr = req.body.descr;
    if(!descr){
        throw ErrorFactory.getError(AppErrorEnum.MISSING_DESCR);
    }
    const result = descrSchema.safeParse(descr);
    if(!result.success){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_DESCR);
    }
    next();
}

export async function checkMaxCapacity(req: Request, _res: Response, next: NextFunction){
    const max_capacity = req.body.max_capacity;
    if(!max_capacity){
        throw ErrorFactory.getError(AppErrorEnum.MISSING_MAX_CAPACITY);
    }
    const result = maxCapacitySchema.safeParse(max_capacity);
    if(!result.success){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_MAX_CAPACITY);
    }
    next();
}

export async function checkUserId(req: Request, _res: Response, next: NextFunction){
    const user_id = req.body.user_id;
    if(!user_id){
        throw ErrorFactory.getError(AppErrorEnum.MISSING_USER_ID);
    }
    const result = userIdSchema.safeParse(user_id);
    if(!result.success){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_USERID);
    }
    next();
}

// ---------------- UPDATE (campi opzionali) ----------------

export async function checkNameOpt(req: Request, _res: Response, next: NextFunction){
    const name = req.body.name;
    if(name === undefined) return next();
    const result = nameSchema.safeParse(name);
    if(!result.success){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_NAME);
    }
    next();
}

export async function checkTypeOpt(req: Request, _res: Response, next: NextFunction){
    const type = req.body.type;
    if(type === undefined) return next();
    const result = typeSchema.safeParse(type);
    if(!result.success){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_TYPE);
    }
    next();
}

export async function checkDescrOpt(req: Request, _res: Response, next: NextFunction){
    const descr = req.body.descr;
    if(descr === undefined) return next();
    const result = descrSchema.safeParse(descr);
    if(!result.success){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_DESCR);
    }
    next();
}

export async function checkMaxCapacityOpt(req: Request, _res: Response, next: NextFunction){
    const max_capacity = req.body.max_capacity;
    if(max_capacity === undefined) return next();
    const result = maxCapacitySchema.safeParse(max_capacity);
    if(!result.success){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_MAX_CAPACITY);
    }
    next();
}

export async function checkUserIdOpt(req: Request, _res: Response, next: NextFunction){
    const user_id = req.body.user_id;
    if(user_id === undefined) return next();
    const result = userIdSchema.safeParse(user_id);
    if(!result.success){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_USERID);
    }
    next();
}