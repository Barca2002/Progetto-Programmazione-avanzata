import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";
import { AppError } from "../models/AppErrorModel.js";
import { AuthService } from "../services/AuthService.js"
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { UserCreationData } from "../models/UserModel.js";
import { DatabaseConnection } from "../singleton/DBConnection.js";
import { AdminService } from "../services/AdminService.js";

export class AuthController {
    private authService: AuthService;
    private adminService: AdminService;

    constructor() {
        this.authService = new AuthService();
        this.adminService = new AdminService();
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
            if(!(await this.adminService.findByEmail(email))){
                throw ErrorFactory.getError(AppErrorEnum.EMAIL_NOT_EXIST);
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

    public async register (req: Request, res: Response) {
        try {
            const { username, email } = req.body;
            // Controlliamo se l'email già esiste
            if(await this.adminService.findByEmail(email)){
                throw ErrorFactory.getError(AppErrorEnum.EMAIL_ALREADY_EXISTS);
            }
            // Controlliamo se l'username già esiste
            if(await this.adminService.findByUsername(username)){
                throw ErrorFactory.getError(AppErrorEnum.USERNAME_ALREADY_EXISTS);
            }
            const passwordHash = await this.authService.hashPassword(req.body.password);
            // Creiamo il nuovo utente
            const userInfo: UserCreationData = {
                "username": req.body.username.trim(),
                "email": req.body.email,
                "password": passwordHash,
                "is_admin": req.body.is_admin ?? false // Fallback false se non viene assegnato
            }
            await this.adminService.createUtente(userInfo);

            const responseData = {"username": username, "email": email};
            res.send(SuccessFactory.getSuccess(AppSuccessEnum.USER_REGISTERED, responseData));
        } catch (err) {
            if (err instanceof AppError){
                (err as AppError).send(res)
            } else {
                res.send(ErrorFactory.getError(AppErrorEnum.INTERNAL_ERROR));
            }
        }
    }

    
}