import { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import * as z from 'zod';
// L'mmsi deve essere una stringa di 9 caratteri che contiene solo numeri.
const mmsiSchema = z.string().length(9).regex(/^\d+$/);

export async function checkMmsi(req: Request, _res: Response, next: NextFunction){
    const mmsi = req.params.mmsi ? req.params.mmsi : String(req.body.mmsi); //l'mmsi può arrivare come string dai params o come number dal body, cosi includo entrambi i casi
    console.log(mmsi, typeof mmsi)
    const result = mmsiSchema.safeParse(mmsi);
    if(!result.success){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_MMSI);
    }
    next();
}