import { Request, Response } from "express";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";


export class AuthController {
    private authService: AuthService;

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
    async login (req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const jwtToken = await this.authService.login(email, password);

            const responseData: SuccessDataStructure = {token: jwtToken};

            SuccessFactory.getStatus(AppSuccessNames.USER_LOGGED_IN, res,  responseData);
        } catch (err) {
            if (err instanceof AppError){
                (err as AppError).send(res)
            }
        }
    }

    /**
     * Metodo del controller per la gestione della registrazioen di un nuovo utente. Si occupa di recuperare i dati nel body della richiesta 
     * per poi mandarli al service che si occupa di creare un nuovo utente e generare il token JWT per l'accesso
     * @param req oggetto Request che contiene i dati della richiesta tra cui, nel body, lo username, l'email e la password
     * @param res oggetto Response che serve per restituire in risposta, il token generato o, se la richiesta non va a buon fine, il rispettivo errore
     */
    async register (req: Request, res: Response) {
        try {
            const { email, password, username } = req.body;

            const jwtToken = await this.authService.register(email, password, username);

            const responseData: SuccessDataStructure = {token: jwtToken};
            
            SuccessFactory.getStatus(AppSuccessNames.USER_REGISTERED, res,  responseData);
        } catch (err) {
            if (err instanceof AppError){
                (err as AppError).send(res)
            }
        }
    }
}