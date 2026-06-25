import bcrypt from 'bcrypt';
import { AdminDAO } from "../dao/AdminDAO.js";
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import jwt from 'jsonwebtoken';
import { User, UserCreationData } from '../models/UserModel.js';


export class AuthService{
    public readonly adminDao = new AdminDAO();
    private privateKey: string;
    public readonly saltRounds = 12;

     constructor() {
        // Lettura della chiave privata dal .env
        const privateKeyBase64 = process.env.JWT_PRIVATE_KEY;
        if (!privateKeyBase64){
            
            throw ErrorFactory.getError(AppErrorEnum.JWT_SECRET_MISSING);
        }
        try {
        // Decodifica della chiave da Base64 a formato PEM originale
        this.privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf8');
        } catch (error) {
        throw ErrorFactory.getError(AppErrorEnum.JWT_SECRET_MISSING);
        }
    }
    // Si prende l'utente, identificato univocamente dall'email, per comparare la password e poi prendere i suoi dati per generare il token JWT
    public async checkCreds(email: string, password: string): Promise<string> {
        const user = await this.adminDao.findByEmail(email);
        if (!user)
            throw ErrorFactory.getError(AppErrorEnum.EMAIL_NOT_EXIST);
        const pwdMatch = await bcrypt.compare(password.trim(), user.password);
        if (!pwdMatch)
            throw ErrorFactory.getError(AppErrorEnum.INCORRECT_PASSWORD);
        return await this.generateJWT(user);
  }

    public async generateJWT(user: User){
        if (!user)
            throw ErrorFactory.getError(AppErrorEnum.USER_NOT_FOUND);
        const payload = {
            "user_id": user.get("user_id"), 
            "email": user.get("email"),
            "is_admin": user.get("is_admin")
        }
        const jwtToken: string = jwt.sign(payload, this.privateKey, { algorithm: "RS256", expiresIn: "1h" });

        return jwtToken;
    }

    public async hashPassword(pwd: string) {
        if (!pwd || pwd.trim().length === 0)
            throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
        return await bcrypt.hash(pwd.trim(), this.saltRounds);
    }

    public async checkUserId (id: number){
    // Controlla se l'user id è valido, cioè se è un numero e se non è minore o uguale a 0.
    if (isNaN(id) || id <= 0) {
      throw ErrorFactory.getError(AppErrorEnum.INVALID_USERID);
    }
    return true;
  }

  public async login (email: string, password: string){
    if (!email || !password)
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    // Ritorna il token JWT se l'autenticazione va a buon fine.
    return await this.checkCreds(email, password);
  }

  public async register (email: string, username: string, password: string){
    if (!email || !username || !password)
      throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    // Controlliamo se l'email già esiste
    if(await this.adminDao.findByEmail(email)){
        throw ErrorFactory.getError(AppErrorEnum.EMAIL_ALREADY_EXISTS);
    }
    // Controlliamo se l'username già esiste
    if(await this.adminDao.findByUsername(username)){
        throw ErrorFactory.getError(AppErrorEnum.USERNAME_ALREADY_EXISTS);
    }
    // Se le credenziali inserite non esistono già, si calcola l'hash della password e si ritorna quella.
    const passwordHash =  await this.hashPassword(password.trim());
    // Creiamo il nuovo utente
    const userInfo: UserCreationData = {
        "username": username.trim(),
        "email": email,
        "password": passwordHash,
        "is_admin": false // La registrazione di default non permette di creare account admin per motivi di sicurezza.
    }
    return userInfo;
  }
    
}