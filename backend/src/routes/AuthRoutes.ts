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
 * Rotta per il login. Valida i dati del body della richiesta tramite un middleware e successivamente controlla l'esistenza e la validità delle credenziali. Infine genera il token JWT per autenticare le richieste successive.
 */
authRouter.post('/login', validateLoginBody, async function (req: Request, res: Response) {
    await authController.login(req, res);
});

/**
* Rotta di registrazione. Valida i dati del body della richiesta tramite un middleware e poi salva nel database le nuove credenziali, se non sono già presenti. Dopo la registrazione il login non è automatico, bisogna chiamare la rotta di login per ottenere il token JWT per autenticarsi.
 */
authRouter.post('/register', validateRegisterBody, async function(req: Request, res: Response) {
    await authController.register(req, res);
});