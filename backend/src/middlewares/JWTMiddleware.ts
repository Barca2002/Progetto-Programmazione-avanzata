import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';

const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;
  if (!JWT_PUBLIC_KEY){
      throw ErrorFactory.getError(AppErrorEnum.JWT_SECRET_MISSING);
  }
// Decodifica della chiave pubblica da base64 al formato normale (formato PEM).
const publicKey = Buffer.from(JWT_PUBLIC_KEY, 'base64').toString('utf8');
  if(!publicKey){
    throw ErrorFactory.getError(AppErrorEnum.JWT_SECRET_MISSING);
  }

// funzione per controllare struttura del token, prende l'authorization header.
export function checkToken (req: Request) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw ErrorFactory.getError(AppErrorEnum.MISSING_AUTH_HEADER);
  }
  if (!authHeader.startsWith('Bearer ')){
    throw ErrorFactory.getError(AppErrorEnum.INVALID_AUTH_HEADER);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw ErrorFactory.getError(AppErrorEnum.JWT_TOKEN_EMPTY);
  }

  try {
    const jwtdecoded = decodeJwt(token);
    return jwtdecoded;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw ErrorFactory.getError(AppErrorEnum.JWT_TOKEN_EXPIRED);
    } else {
      throw ErrorFactory.getError(AppErrorEnum.JWT_TOKEN_INVALID);
    }
  }
};

// Controlliamo il token, ma non ci interessa il campo is admin
export function checkUserRole (req: Request, res: Response, next: NextFunction): void {
  // Basta controllare il token
  checkToken(req);
  next();
};

// Si controlla il campo is_admin nel token
export function checkAdminRole (req: Request, res: Response, next: NextFunction): void {
  const jwtdecoded = checkToken(req);
  if (!jwtdecoded.is_admin) {
    throw ErrorFactory.getError(AppErrorEnum.NOT_ADMIN);
  }
  next();
};

export function decodeJwt(token: string){
  const decodedToken = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as JwtPayload;
  if(!decodedToken){
    throw ErrorFactory.getError(AppErrorEnum.JWT_VERIFY_ERROR);
  }
  return decodedToken;
}