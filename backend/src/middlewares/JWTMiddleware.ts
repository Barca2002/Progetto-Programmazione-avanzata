import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';

const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;

if (!JWT_PUBLIC_KEY){
    throw ErrorFactory.getError(AppErrorEnum.JWT_SECRET_MISSING);
}

let publicKeyBase64: string;

try {
  publicKeyBase64 = Buffer.from(JWT_PUBLIC_KEY, 'base64').toString('utf8');
} catch (error) {
  throw ErrorFactory.getError(AppErrorEnum.JWT_SECRET_MISSING);
}

// funzione per controllare struttura del token
const checkToken = (req: Request, next: NextFunction): any => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ErrorFactory.getError(AppErrorEnum.JWT_NOT_PROVIDED));
  }

  const isToken = authHeader.split(' ')[1];

  if (!isToken) {
    return next(ErrorFactory.getError(AppErrorEnum.JWT_TOKEN_EMPTY));
  }

  try {
    const jwtdecoded = jwt.verify(isToken, publicKeyBase64, { algorithms: ['RS256'] }) as any;
    (req as any).userLoggato = jwtdecoded; //MOLTO IMPORTANTE PERCHE' APPENDE LO USER NELLA REQUEST, COSI SAPPIAMO QUALE UTENTE E' AUTENTICATO
    //console.log((req as any));
    return jwtdecoded;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(ErrorFactory.getError(AppErrorEnum.JWT_TOKEN_EXPIRED));
    } else {
      next(ErrorFactory.getError(AppErrorEnum.JWT_TOKEN_INVALID));
    }
    return null;
  }
};

// utente qualsiasi autenticato
export const checkUser = (req: Request, res: Response, next: NextFunction): void => {
  const jwtdecoded = checkToken(req, next);
  if (jwtdecoded) next();
};

// solo admin
export const checkAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const jwtdecoded = checkToken(req, next);
  if (!jwtdecoded) return;

  if (!jwtdecoded.is_admin) {
    return next(ErrorFactory.getError(AppErrorEnum.NOT_ADMIN));
  }

  next();
};