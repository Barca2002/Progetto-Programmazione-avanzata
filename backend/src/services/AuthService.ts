import bcrypt from 'bcrypt';
import { UserDAO } from "../dao/UserDAO.js";
import { ErrorFactory } from '../factory/ErrorFactory.js';
import { AppErrorEnum } from '../utils/StatusMessages.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { User } from '../models/UserModel.js';


export class AuthService{
    public readonly userDao = new UserDAO();
    private privateKey: string;

     constructor() {
        // Lettura della chiave privata
        const keyPath = process.env.JWT_SECRET_KEY_PATH || "./keys/jwtRS256.key";
        if (!keyPath){
            throw ErrorFactory.getError(AppErrorEnum.JWT_SECRET_MISSING);
        }
        this.privateKey = fs.readFileSync(keyPath).toString();
    }

    public async checkCreds(email:string, password:string): Promise<string>{
        // Prendiamo l'utente per comparare la password e poi prendere i suoi dati per generare il token JWT
        const user = await this.userDao.findByEmail(email);
        const isMatch = await bcrypt.compare(password.trim(), user!.get("password") as string);

        if (!isMatch) {
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
        const jwtToken: string = jwt.sign(payload, this.privateKey, { algorithm: "RS256" });

        return jwtToken;
    }

    
}