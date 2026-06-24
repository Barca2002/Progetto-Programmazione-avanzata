import { Router, Response, Request } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { loginValidationPipeline, registerValidationPipeline } from "../middlewares/AuthMiddleware.js";


// Istanziamo il router e il controller per gestire le rotte di autenticazione.
export const authRouter = Router();
const authController = new AuthController();

/**
 * Rotta per il login. Viene passato validateLogin per definire la pipeline di validazione delle credenziali.
 * 1. Riceve le credenziali (email e password)
 * 2. Esse vengono validate tramite la pipeline definita in validateLogin(checkEmail e checkPassword) da AuthMiddleware.
 * 3. Genera il token JWT di autenticazione
 */
authRouter.post('/login', loginValidationPipeline, async function (req: Request, res: Response) {
    await authController.login(req, res);
});

authRouter.post('/register', registerValidationPipeline, async function(req: Request, res: Response) {
    await authController.register(req, res);
});



