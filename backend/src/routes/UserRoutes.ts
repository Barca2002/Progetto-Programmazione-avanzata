import { Router, Request, Response } from "express";
import { UserController } from "../controllers/UserController.js";
import { checkUserRole } from "../middlewares/JWTMiddleware.js";
import { tokenBalanceCheck } from "../middlewares/TokenMiddleware.js";
import { checkDatiInviati } from "../middlewares/DatiInviatiMiddleware.js";

export const userRouter = Router();
const userController = new UserController();

userRouter.use(checkUserRole); // Tutte le rotte di questo router richiedono il ruolo "user"

userRouter.post("/imbarcazione/send/status", tokenBalanceCheck, checkDatiInviati, async function(req: Request, res: Response) {
    await userController.sendData(req, res);
});

// ------------- ROTTE IMBARCAZIONI ----------------
userRouter.get("/imbarcazioni/get/status/geoareaid/:geoarea_id", tokenBalanceCheck, checkUserRole, async function(req: Request, res: Response) {
    await userController.getMyImbarcazioniStatus(req, res);
});

// GET imbarcazioni dell'utente loggato con geofence associate
userRouter.get("/imbarcazioni/geoaree/get/my",  async function(req: Request, res: Response) {
    await userController.getMyImbarcazioniWithGeofenceareas(req, res);
});

// GET tutte le proprie imbarcazioni le relative segnalazioni associate
userRouter.get("/imbarcazioni/segnalazioni/get/my", async function(req: Request, res: Response) {
    await userController.getMyImbarcazioniWithSegnalazioni(req, res);
});

// ---------- ROTTE PER IL SALDO DEI TOKEN --------------
userRouter.get("/get/tokenbalance", async function(req: Request, res: Response){
    await userController.getMyTokenBalance(req, res);
});
