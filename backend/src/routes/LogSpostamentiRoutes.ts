import { Router, Request, Response } from "express";
import { LogSpostamentiController } from "../controllers/LogSpostamentiController.js";
import { checkUser } from "../middlewares/JWTMiddleware.js";

export const logSpostamentiRoutes = Router();
const logSpostamenti = new LogSpostamentiController();

// GET tutte le imbarcazioni con segnalazioni e relativo stato (utente e admin)
logSpostamentiRoutes.get("/all", checkUser, async function(req: Request, res: Response) {
    await logSpostamenti.getAllImbarcazioniConSegnalazioni(req, res);
});