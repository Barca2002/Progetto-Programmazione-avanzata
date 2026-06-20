import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';

const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;

if (!JWT_PUBLIC_KEY){
    throw ErrorFactory.getError(AppErrorEnum.JWT_SECRET_MISSING);
}

let publicKeyBase64: string; //perchè const ovviamente protegge dal riassegnamento

try {
  publicKeyBase64 = Buffer.from(JWT_PUBLIC_KEY, 'base64').toString('utf8');
} catch (error) {
  throw ErrorFactory.getError(AppErrorEnum.JWT_SECRET_MISSING);
}

export const JWTMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ErrorFactory.getError(AppErrorEnum.JWT_TOKEN_ADMIN_MISSING));
  }

  const isToken = authHeader.split(' ')[1];

  if (!isToken) {
    return next(ErrorFactory.getError(AppErrorEnum.JWT_TOKEN_EMPTY));
  }

  try {
    const jwtdecoded = jwt.verify(isToken, publicKeyBase64, { algorithms: ['RS256'] }) as any;

    if (!jwtdecoded.is_admin) {
      return next(ErrorFactory.getError(AppErrorEnum.NOT_ADMIN));
    }

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) { //serve per vedere perche il token non va bene, è scaduto o malformato, non valido.
      return next(ErrorFactory.getError(AppErrorEnum.JWT_TOKEN_EXPIRED));
    }
    return next(ErrorFactory.getError(AppErrorEnum.JWT_TOKEN_INVALID));
  }
};