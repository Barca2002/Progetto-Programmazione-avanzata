import bcrypt from 'bcrypt';
import { UserDAO } from "../dao/UserDAO.js";
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/UserModel.js';


export class AuthService{
    public readonly userDao = new UserDAO();
    private privateKey: string;

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
    public async checkCreds(email:string, password:string): Promise<string>{
        
        const user = await this.userDao.findByEmail(email);
        const pwdMatch = await bcrypt.compare(password.trim(), user!.get("password") as string);

        if (!pwdMatch) {
            throw ErrorFactory.getError(AppErrorEnum.INCORRECT_PASSWORD);
        }

        return await this.generateJWT(user!);
    }

    public async generateJWT(user: User){

        const payload = {
            "user_id": user?.get("user_id"), 
            "email": user?.get("email"),
            "is_admin": user?.get("is_admin")
        }
        const jwtToken: string = jwt.sign(payload, this.privateKey, { algorithm: "RS256", expiresIn: "1m" }); //CAMBIARE COME VOGLIAMO, MI SERVE PER VEDERE SE ENTRA NELL'ERRORE

        return jwtToken;
    }

    
}