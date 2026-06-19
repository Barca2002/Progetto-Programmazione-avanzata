import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { AppError } from "../models/AppErrorModel.js";
import { AuthService } from "../services/AuthService.js"
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { UserDAO } from "../dao/UserDAO.js";

export class AuthController {
    private authService: AuthService;
    public readonly userDAO = new UserDAO();
    public readonly saltRounds = 12;

    constructor() {
        this.authService = new AuthService();
    }

    /**
     * Metodo del controller per la gestione del login. Si occupa di recuperare i
     * dati nel body della richiesta per poi mandarli al service che si occupa di
     * generare il token JWT
     */
    public async login (req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            // Controlliamo se l'email esiste
            if(!(await this.userDAO.findByEmail(email))){
                return res.json(ErrorFactory.getError(AppErrorEnum.EMAIL_NOT_EXIST));
            }
            // Generazione del token
            const jwtToken = await this.authService.checkCreds(email, password);
            const responseData = {token: jwtToken};

            res.send(SuccessFactory.getSuccess(AppSuccessEnum.USER_LOGGED_IN, responseData));
        } catch (err) {
            if (err instanceof AppError){
                (err as AppError).send(res)
            } else {
                res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
            }
        }
    }

    
}