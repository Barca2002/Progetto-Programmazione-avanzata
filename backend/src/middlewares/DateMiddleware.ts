import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';


const dateFormatRegex = /^\d{2}[-/]\d{2}[-/]\d{4}$/;

const dateSchema = z.object({
  start_date: z.string().regex(dateFormatRegex),
  end_date: z.string().regex(dateFormatRegex).optional()
});

export function validateDateFormat(req: Request, res: Response, next: NextFunction): void {
  const result = dateSchema.safeParse(req.body);

  if (!result.success) {
    // Prendiamo il primo errore riscontrato da Zod
        const firstIssue = result.error.issues[0]!;
        const fieldName = firstIssue.path[0];

        // Mappiamo il nome del campo fallito sul rispettivo errore
        switch (fieldName) {
            case "start_date":
                return next(ErrorFactory.getError(AppErrorEnum.INVALID_START_DATE));
            case "end_date":
                return next(ErrorFactory.getError(AppErrorEnum.INVALID_END_DATE));
            default:
                return next(ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA));
        }
  }

  next();
}