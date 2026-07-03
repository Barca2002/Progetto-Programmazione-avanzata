import { Router, Request, Response } from "express";
import { UserController } from "../controllers/UserController.js";
import { checkUserRole } from "../middlewares/JWTMiddleware.js";
import { checkTokenBalance } from "../middlewares/TokenMiddleware.js";
import { checkDatiInviati } from "../middlewares/DatiInviatiMiddleware.js";

export const userRouter = Router();
const userController = new UserController();

userRouter.use(checkUserRole); // Tutte le rotte di questo router richiedono il ruolo "user"

userRouter.post("/imbarcazione/send/status", checkTokenBalance, checkDatiInviati, async function(req: Request, res: Response) {
    await userController.sendData(req, res);
});

// ------------- ROTTE IMBARCAZIONI ----------------
userRouter.get("/imbarcazioni/get/my/status/geoareaid/:geoarea_id", checkTokenBalance, checkUserRole, async function(req: Request, res: Response) {
    await userController.getMyImbarcazioniStatus(req, res);
});

// GET imbarcazioni dell'utente loggato con geofence associate
userRouter.post("/imbarcazioni/geoaree/get/my",  async function(req: Request, res: Response) {
    await userController.getMyImbarcazioniWithGeofenceareas(req, res);
});

// GET tutte le proprie imbarcazioni le relative segnalazioni associate
userRouter.post("/imbarcazioni/segnalazioni/get/my", async function(req: Request, res: Response) {
    await userController.getMyImbarcazioniWithSegnalazioni(req, res);
});

// ---------- ROTTE PER IL SALDO DEI TOKEN --------------
userRouter.get("/get/tokenbalance", async function(req: Request, res: Response){
    await userController.getMyTokenBalance(req, res);
});
