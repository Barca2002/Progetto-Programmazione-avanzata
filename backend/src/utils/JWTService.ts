import { UserDAO } from "../dao/UserDAO";
import { UserModel } from "../models/UserModel.js";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppSuccessEnum } from "./StatusMessages.js";

import jwt from "jsonwebtoken";
import fs from "fs";

export class JWTService {
    private userDao: UserDAO;
    private privateKey: string;

    /**
     * Costruttore del Service che istanzia il DAO da chiamre per agire sul db
     * e recupera la chiave privata dal path nell'env che verrà utilizzata per il login e la registrazione
     */
    constructor() {
        this.userDao = new UserDAO();

        const key_path = process.env.JWT_SECRET_KEY_PATH || "./keys/jwtRS256.key";
        if (!key_path) {
            throw ErrorFactory.getError(AppErrorEnum.JWT_SECRET_MISSING);
        }
        this.privateKey = fs.readFileSync(key_path).toString();
    }


 private signJWT(user: UserModel): string {
        if (!this.privateKey) {
            throw ErrorFactory.getError(AppErrorEnum.JWT_SECRET_MISSING);
        }


        const jwtToken: string = jwt.sign({ 
                userId: user.get("userId"), 
                email: user.get("email"), 
                isAdmin: user.get("isAdmin") 
            },  
            this.privateKey, 
            {algorithm: "RS256", expiresIn: "1h"});

        return jwtToken;
    }