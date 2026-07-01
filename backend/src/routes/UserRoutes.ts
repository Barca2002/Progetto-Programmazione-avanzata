import { Router, Request, Response } from "express";
import { UserController } from "../controllers/UserController.js";
import { checkUserRole } from "../middlewares/JWTMiddleware.js";
import { tokenBalanceCheck } from "../middlewares/TokenMiddleware.js";
import { checkDatiInviati } from "../middlewares/DatiInviatiMiddleware.js";

export const userRouter = Router();
const userController = new UserController();

// Invio dati istantanei (user)
// {
//     "mmsi": 247123456,
//     "latitudine": 43.680000,
//     "longitudine": 13.52000,
//     "velocita_kmh": 65.34,
//     "stato": "IN NAVIGAZIONE"
// }
userRouter.post("imbarcazione/send/status", checkUserRole, tokenBalanceCheck, checkDatiInviati, async function(req: Request, res: Response) {
    await userController.sendData(req, res);
});

// ------------- ROTTE IMBARCAZIONI ----------------
userRouter.get("/imbarcazioni/get/status/geoarea_id/:geoarea_id", checkUserRole, tokenBalanceCheck, checkUserRole, async function(req: Request, res: Response) {
    await userController.getMyImbarcazioniStatus(req, res);
});

// GET imbarcazioni dell'utente loggato con geofence associate
userRouter.get("/imbarcazioni/get/withgeoaree/my", checkUserRole,  async function(req: Request, res: Response) {
    await userController.getMyImbarcazioniWithGeofenceareas(req, res);
});

// GET tutte le imbarcazioni le relative segnalazioni associate
userRouter.get("/imbarcazioni/get/segnalazioni/all",  async function(req: Request, res: Response) {
    await userController.getMyImbarcazioniWithSegnalazioni(req, res);
});

//------------------------------------------

// ---------- ROTTE PER IL SALDO DEI TOKEN --------------
userRouter.get("/get/tokenbalance", async function(req: Request, res: Response){
    await userController.getMyTokenBalance(req, res);
});
