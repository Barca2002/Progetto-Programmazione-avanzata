import { Router, Response, Request, NextFunction } from "express";
// import { AuthController } from "../controllers/AuthController";
import { validateLogin } from "../middlewares/AuthMiddleware.js";
import { AppErrorNames } from "../utils/StatusMessages.js";
import { ErrorFactory } from "../factory/ErrorFactory.js";

// Istanziamo il router e il controller per gestire le rotte di autenticazione.
export const authRouter = Router();
// const authController = new AuthController();

/**
 * Rotta per il login. Viene passato validateLogin per definire la pipeline di validazione delle credenziali.
 * 1. Riceve le credenziali (email e password)
 * 2. Esse vengono validate tramite la pipeline definita in validateLogin(checkEmail e checkPassword) da AuthMiddleware.
 * 3. Genera il token JWT di autenticazione
 */
authRouter.post('/login', validateLogin, (req: Request, res: Response) => {
    //authController.login(req, res);
});

authRouter.post('/testerrore', (req: Request, res: Response, next: NextFunction) => {
    return res.json({"boh": ErrorFactory.getError(AppErrorNames.INVALID_EMAIL)});
});

