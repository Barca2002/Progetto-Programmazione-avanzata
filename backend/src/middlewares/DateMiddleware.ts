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
    res.send(ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA));
    return;
  }

  next();
}