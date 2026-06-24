import { Router, Request, Response } from "express";
import { UserController } from "../controllers/UserController.js";
import { checkUser } from "../middlewares/JWTMiddleware.js";
import { tokenBalanceCheck } from "../middlewares/TokenMiddleware.js";
import { checkDatiInviati } from "../middlewares/DatiInviatiMiddleware.js";

export const userRoutes = Router();
const userController = new UserController();

// Invio dati istantanei (user)
// {
//     "mmsi": 247123456,
//     "latitudine": 43.680000,
//     "longitudine": 13.52000,
//     "velocita_kmh": 65.34243234234223434232,
//     "stato": "IN NAVIGAZIONE"
// }
userRoutes.get("/sendData", checkUser, tokenBalanceCheck, checkDatiInviati, async function(req: Request, res: Response) {
    await userController.sendData(req, res);
});

