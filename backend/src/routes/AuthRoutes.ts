import { Router, Response, Request } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { validateLoginBody, validateRegisterBody } from "../middlewares/AuthMiddleware.js";

/**
 * Rotte riguardanti la registrazione e login.
 * 1) login: POST /login
 * 2) registrazione: POST /register
 */

export const authRouter = Router();
const authController = new AuthController();

/**
 * Rotta per il login.
 * 1. Valida i dati del body della richiesta tramite la funzione validateLoginBody di AuthMiddleware.ts.
 * 2. Controlla l'esistenza e la validità delle credenziali
 * 3. Genera il token JWT per autenticare le richieste successive (vale per 1 ora il token JWT)
 */
authRouter.post('/login', validateLoginBody, async function (req: Request, res: Response) {
    await authController.login(req, res);
});

/**
* Rotta di registrazione.
 * 1. Valida i dati del body della richiesta tramite la funzione validateRegisterBody di AuthMiddleware.ts.
 * 2. Salva nel database le nuove credenziali.
 * Il login non è automatico, bisogna chiamare la rotta di login per ottenere il token JWT.
 */
authRouter.post('/register', validateRegisterBody, async function(req: Request, res: Response) {
    await authController.register(req, res);
});