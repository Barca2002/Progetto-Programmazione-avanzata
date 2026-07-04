import bcrypt from 'bcrypt';
import { AdminDAO } from "../dao/AdminDAO.js";
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import jwt from 'jsonwebtoken';
import { User, UserCreationData } from '../models/UserModel.js';

export class AuthService {
    private readonly adminDao = new AdminDAO();
    private readonly privateKey: string;
    private readonly saltRounds = 12;

    /**
     * Lettura e decodifica da Base64 a formato PEM della chiave privata dal file .env. Essa serve per generare i token JWT.
     */
    constructor() {
        const privateKeyBase64 = process.env.JWT_PRIVATE_KEY;
        if (!privateKeyBase64) {
            throw ErrorFactory.getError(AppErrorEnum.JWT_SECRET_MISSING);
        }
        try {
            this.privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf8');
        } catch {
            throw ErrorFactory.getError(AppErrorEnum.JWT_TOKEN_KEY_ERROR);
        }
    }

    /**
     * Controlla le credenziali (email e password). In caso di email inesistente o password errata, vengono generate delle eccezioni.
     * @param email stringa che contiene l'email da controllare.
     * @param password stringa che contiene la password da controllare con la versione hashata nel database.
     * @returns oggetto User contenente l'utente corrispondente alle credenziali.
     */
    public async autenticateUser(email: string, password: string): Promise<User> {
        const user = await this.adminDao.getByEmail(email);
        if (!user) {
            throw ErrorFactory.getError(AppErrorEnum.EMAIL_NOT_EXIST);
        }
        const pwdMatch = await bcrypt.compare(password.trim(), user.password);
        if (!pwdMatch) {
            throw ErrorFactory.getError(AppErrorEnum.INCORRECT_PASSWORD);
        }
        return user;
    }

    /**
     * Genera il token JWT tramite un oggetto User, già autenticato dalla funzione autenticateUser. La durata del token è di 1 ora.
     * @param user oggetto contenete l'utente autenticato.
     * @returns stringa contenente il token JWT.
     */
    public generateJWT(user: User): string {
        if (!user) {
            throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
        }
        const jwtPayload = {
            "user_id": user.get("user_id"),
            "email": user.get("email"),
            "is_admin": user.get("is_admin")
        }
        const jwtToken = jwt.sign(jwtPayload, this.privateKey, { algorithm: "RS256", expiresIn: "1h" });

        return jwtToken;
    }

    /**
     * Genera un hash della password passata come argomento tramite l'algoritmo bcrypt.
     * @param pwd stringa contenente una password da hashare.
     * @returns stringa contenente l'hash della password.
     */
    public async hashPassword(pwd: string): Promise<string> {
        if (!pwd || pwd.trim().length === 0) {
            throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
        }
        return await bcrypt.hash(pwd.trim(), this.saltRounds);
    }

    /**
     * Controlla se lo userid passato come argomento è valido, cioè è un numero 
     * @param id numero che rappresenta l'id dell'utente.
     */
    public checkUserId(id: number) {
        if (Number.isNaN(id) || id <= 0 || !Number.isInteger(id)) {
            throw ErrorFactory.getError(AppErrorEnum.INVALID_USERID);
        }
    }

    /**
     * Controlla le credenziali ed autentica l'utente tramite la funzione autenticateUser. Successivamente genera il token JWT tramite la funzione generateJWT e lo restituisce.
     * @param email stringa contenente l'email.
     * @param password stringa contente la password.
     * @returns oggetto Promise di stringa contenente il token JWT.
     */
    public async login(email: string, password: string): Promise<string> {
        if (!email || !password) {
            throw ErrorFactory.getError(AppErrorEnum.MISSING_DATA);
        }
        const user = await this.autenticateUser(email, password);
        return this.generateJWT(user);
    }

    /**
     * Registra un utente controllando se le credenziali fornite sono già state usate. Se non sono già usate, crea l'hash della password e restituisce le informazioni all'AuthController. Di default l'utente creato non è admin per ovvi motivi di sicurezza.
     * @param email stringa contenente l'email.
     * @param username stringa contenente l'username.
     * @param password stringa contenente la password.
     * @returns oggetto Promise che implementa l'interfaccia UserCreationData, cioè i dati necessari per la creazione di un utente.
     */
    public async register(email: string, username: string, password: string): Promise<UserCreationData> {
        if (!email || !username || !password) {
            throw ErrorFactory.getError(AppErrorEnum.MISSING_DATA);
        }
        if (await this.adminDao.getByEmail(email)) {
            throw ErrorFactory.getError(AppErrorEnum.EMAIL_ALREADY_EXISTS);
        }
        if (await this.adminDao.getByUsername(username)) {
            throw ErrorFactory.getError(AppErrorEnum.USERNAME_ALREADY_EXISTS);
        }

        const passwordHash = await this.hashPassword(password.trim());
        const newUserInfo: UserCreationData = {
            "username": username.trim(),
            "email": email,
            "password": passwordHash,
            "is_admin": false
        }
        return newUserInfo;
    }
}