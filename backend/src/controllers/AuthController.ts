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

    /**
     * Costruttore che inizializza l'attributo contenente l'oggetto della classe AuthService
     */
    constructor() {
        this.authService = new AuthService();
    }

    /**
     * Metodo del controller per la gestione del login. Si occupa di recuperare i dati nel body della richiesta 
     * per poi mandarli al service che si occupa di generare il token JWT
     * @param req oggetto Request che contiene i dati della richiesta tra cui, nel body, l'email e la password
     * @param res oggetto Response che serve per restituire in risposta, il token generato o, se la richiesta non va a buon fine, il rispettivo errore
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

    /**
     * Metodo del controller per la gestione della registrazioen di un nuovo utente. Si occupa di recuperare i dati nel body della richiesta 
     * per poi mandarli al service che si occupa di creare un nuovo utente e generare il token JWT per l'accesso
     * @param req oggetto Request che contiene i dati della richiesta tra cui, nel body, lo username, l'email e la password
     * @param res oggetto Response che serve per restituire in risposta, il token generato o, se la richiesta non va a buon fine, il rispettivo errore
     */
    
}