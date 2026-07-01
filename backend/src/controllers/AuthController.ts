import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { AppError } from "../models/AppErrorModel.js";
import { AuthService } from "../services/AuthService.js"
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { AdminService } from "../services/AdminService.js";

export class AuthController {
    public readonly authService = new AuthService();
    public readonly adminService = new AdminService();
    /**
     * Metodo del controller per la gestione del login. Si occupa di recuperare i
     * dati nel body della richiesta per poi mandarli al service che si occupa di
     * generare il token JWT
     */
    public async login(req: Request, res: Response){
        try {
            const { email, password } = req.body;
            
            // Generazione del token
            const jwtToken = await this.authService.login(email, password);
            const responseData = {token: jwtToken};

            res.send(SuccessFactory.getSuccess(AppSuccessEnum.USER_LOGGED_IN, responseData));
        } catch (err) {
            if (err instanceof AppError){
                err.send(res)
            } else {
                res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
            }
        }
    }

    public async register(req: Request, res: Response){
        try {
            const { username, email, password } = req.body;
            
            const newUser = await this.authService.register(email, username, password);
            await this.adminService.createUtente(newUser);

            const responseData = {"username": username, "email": email};
            res.send(SuccessFactory.getSuccess(AppSuccessEnum.USER_REGISTERED, responseData));
        } catch (err) {
            if (err instanceof AppError){
                err.send(res)
            } else {
                res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
            }
        }
    }

    
}