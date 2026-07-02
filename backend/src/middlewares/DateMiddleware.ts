import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppErrorEnum, AppErrorName } from '../utils/StatusMessages.js';
import { isMissingIssue, validateBody } from '../utils/HelperFunctions.js';

const dateFormatRegex = /^\d{2}[-/]\d{2}[-/]\d{4}$/;

const dateSchema = z.object({
  start_date: z.string().regex(dateFormatRegex),
  end_date: z.string().regex(dateFormatRegex).optional()
});

function mapErroriDate(campo: string, issue: z.core.$ZodIssue, reqBody: any) {
    const missing = isMissingIssue(issue, reqBody);

    const map: Record<string, { missing: AppErrorName, invalid: AppErrorName }> = {
        start_date: {
            missing: AppErrorEnum.MISSING_START_DATE,
            invalid: AppErrorEnum.INVALID_START_DATE,
        },
        end_date: {
            missing: AppErrorEnum.MISSING_END_DATE,
            invalid: AppErrorEnum.INVALID_END_DATE,
        },
    };

    const entry = map[campo];
    if (!entry){
        return AppErrorEnum.INCORRECT_DATA;
    }

    return missing ? entry.missing : entry.invalid;
}

export function validateDateFormat(req: Request, _res: Response, next: NextFunction) {
    validateBody(req.body, dateSchema, mapErroriDate, next)
}