import { Router, Request, Response } from "express";
import { UserController } from "../controllers/UserController.js";
import { checkUserRole } from "../middlewares/JWTMiddleware.js";
import { tokenBalanceCheck } from "../middlewares/TokenMiddleware.js";
import { checkDatiInviati } from "../middlewares/DatiInviatiMiddleware.js";

export const UserRouter = Router();
const userController = new UserController();

// Invio dati istantanei (user)
// {
//     "mmsi": 247123456,
//     "latitudine": 43.680000,
//     "longitudine": 13.52000,
//     "velocita_kmh": 65.34,
//     "stato": "IN NAVIGAZIONE"
// }
UserRouter.post("/sendData", checkUserRole, tokenBalanceCheck, checkDatiInviati, async function(req: Request, res: Response) {
    await userController.sendData(req, res);
});

UserRouter.get("/imbarcazioni/status", checkUserRole, tokenBalanceCheck, checkUserRole, async function(req: Request, res: Response) {
    await userController.myImbarcazioniStatus(req, res);
});

