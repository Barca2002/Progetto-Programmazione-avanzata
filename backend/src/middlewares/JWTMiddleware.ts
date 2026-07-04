import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { TokenPayload } from '../models/UserModel.js';

const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;
  if (!JWT_PUBLIC_KEY){
      throw ErrorFactory.getError(AppErrorEnum.JWT_SECRET_MISSING);
  }
const publicKey = Buffer.from(JWT_PUBLIC_KEY, 'base64').toString('utf8');
  if(!publicKey){
    throw ErrorFactory.getError(AppErrorEnum.JWT_PUBLIC_DECODE_ERROR);
  }

/**
 * Funzione che prende l'intestazione della richiesta per controllare se il token JWT è valido. In caso positivo, lo decodifica e restituisce l'id dell'utente associato.
 * @param req oggetto contente il body della richiesta.
 * @returns stringa che rappresenta l'id dell'utente associato al token JWT.
 */
export function checkJWTtoken (req: Request): TokenPayload {
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

/**
 * Funzione che controlla se l'utente che invia la richiesta è un utente normale.
 * @param req oggetto che contiene il body della richiesta.
 * @param res oggetto che contiene la risposta alla richiesta.
 * @param next oggetto NextFunction che può essere utilizzato per chiamare un'altra funzione definita in una pipeline.
 */
export function checkUserRole (req: Request, res: Response, next: NextFunction): void {
  try {
    const jwtdecoded = checkJWTtoken(req);
    if (jwtdecoded.is_admin) {
      return next(ErrorFactory.getError(AppErrorEnum.NOT_USER));
    }
    next();
  } catch (err) {
    next(err);
  }
};
/**
 * Funzione che controlla se l'utente che invia la richiesta è un utente admin.
 * @param req oggetto che contiene il body della richiesta.
 * @param res oggetto che contiene la risposta alla richiesta.
 * @param next oggetto NextFunction che può essere utilizzato per chiamare un'altra funzione definita in una pipeline.
 */
export function checkAdminRole (req: Request, res: Response, next: NextFunction): void {
  try {
    const jwtdecoded = checkJWTtoken(req);
    if (!jwtdecoded.is_admin) {
      return next(ErrorFactory.getError(AppErrorEnum.NOT_ADMIN));
    }
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Funzione che verifica un token JWT e restituisce il payload.
 * @param token stringa che contiene un JWT token firmato.
 * @returns oggetto TokenPayload che contiene il payload del JWT token.
 */
export function decodeJwt(token: string): TokenPayload {
  const decodedToken = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
  if(!decodedToken){
    throw ErrorFactory.getError(AppErrorEnum.JWT_VERIFY_ERROR);
  }
  return decodedToken as TokenPayload;
}
