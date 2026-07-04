import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { AppError } from "../models/AppErrorModel.js";
import { AuthService } from "../services/AuthService.js"
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { AdminService } from "../services/AdminService.js";
import { LoginBody, RegisterBody } from "../models/UserModel.js";

export class AuthController {
    private readonly authService = new AuthService();
    private readonly adminService = new AdminService();

    /**
     * Funzione di login. Prede dal body della richiesta l'email e la password, poi genera il token JWT tramite l'authService con le credenziali prese precedentemente. Infine genera la response inviando il token JWT e sfruttando la SuccessFactory.
     * @param req Oggetto di tipo Request contenente i dati della richiesta, tra cui l'email e la password.
     * @param res Oggetto di tipo Response che permette di restituire una risposta alla richiesta, in questo caso il token JWT se la generazione va a buon fine.
     */
    public async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body as LoginBody;
            const jwtToken = await this.authService.login(email, password);
            const responseData = { token: jwtToken };
            SuccessFactory.getSuccess(AppSuccessEnum.USER_LOGGED_IN, responseData).send(res);
        } catch (err) {
            if (err instanceof AppError) {
                err.send(res)
            } else {
                ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
            }
        }
    }

    /**
     * Funzione di registrazione. Prede dal body della richiesta l'email, l'username e la password e le salva nel database tramite l'authService. Infine genera la response restituendo l'email e username salvati e sfruttando la SuccessFactory.
     * @param req Oggetto di tipo Request contenente i dati della richiesta, tra cui l'email e la password.
     * @param res Oggetto di tipo Response che permette di restituire una risposta alla richiesta, in questo caso il token JWT se la generazione va a buon fine.
     */
    public async register(req: Request, res: Response) {
        try {
            const { username, email, password } = req.body as RegisterBody;
            const newUser = await this.authService.register(email, username, password);
            await this.adminService.createUtente(newUser);
            const responseData = { "username": newUser.username, "email": newUser.email };
            SuccessFactory.getSuccess(AppSuccessEnum.USER_REGISTERED, responseData).send(res);
        } catch (err) {
            if (err instanceof AppError) {
                err.send(res)
            } else {
                ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR).send(res);
            }
        }
    }
}