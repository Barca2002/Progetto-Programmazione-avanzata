import { Router, Request, Response } from "express";
import { UserController } from "../controllers/UserController.js";
import { checkUserRole } from "../middlewares/JWTMiddleware.js";
import { checktokenBalance } from "../middlewares/TokenMiddleware.js";
import { checkDatiInviati } from "../middlewares/DatiInviatiMiddleware.js";

/**
 * Rotte riguardanti l'utente. Ogni rotta richiede che l'utente sia un utente normale.
 * 1) invio dati di posizione: POST /imbarcazione/send/status
 * 2) get dei dati di posizione delle proprie imbarcazioni in una certa geofence area: GET /imbarcazioni/get/my/status/geoareaid/:geoarea_id
 * 3) get delle geofence aree autorizzare delle proprie imbarcazioni: POST /imbarcazioni/geoaree/get/my
 * 4) get delle segnalazioni associate alle proprie imbarcazioni: POST /imbarcazioni/segnalazioni/get/my
 * 5) get del proprio saldo dei token: POST /get/tokenbalance
 */

export const userRouter = Router();
const userController = new UserController();

userRouter.use(checkUserRole);

/**
 * Rotta per l'invio dei dati di posizione di un'imbarcazione propria. Ogni richiesta costa 0,025 token. I dati della richiesta sono validati dal middleware DatiInviatiMiddleware.ts. Poi si controlla in che geoarea corrisponde la posizione inviata, se non è in nessuna geofence area, si salva solo il dato inviato, altrimenti si procede con il controllo delle autorizzazioni ad esse per registrare uno spostamento in uscita, entrata o entrambi. Successivamente si controlla se generare una violazione e poi se generare una segnalazione in base al numero di violazioni in una certa finestra temporale.
 * 
 */
userRouter.post("/imbarcazione/send/status", checktokenBalance, checkDatiInviati, async function(req: Request, res: Response) {
    await userController.sendStatus(req, res);
});

/**
 * Rotta che ritorna se le proprie imbarcazioni sono dentro o fuori una certa geofence area. Se un'imbarcazione è dentro, si restituisce anche il tempo di permanenza dall'ultimo dato inviato.
 */
userRouter.get("/imbarcazioni/get/my/status/geoareaid/:geoarea_id", checktokenBalance, checkUserRole, async function(req: Request, res: Response) {
    await userController.getMyImbarcazioniStatus(req, res);
});

/**
 * Rotta che restituisce tutte le geofence aree autorizzate di ogni imbarcazione propria.
 */
userRouter.post("/imbarcazioni/geoaree/get/my",  async function(req: Request, res: Response) {
    await userController.getMyImbarcazioniWithGeofenceareas(req, res);
});

/**
 * Rotta che restituisce tutte le segnalazioni associate ad ogni imbarcazione propria.
 */
userRouter.post("/imbarcazioni/segnalazioni/get/my", async function(req: Request, res: Response) {
    await userController.getMyImbarcazioniWithSegnalazioni(req, res);
});

/**
 * Rotta che restituisce il saldo dei token proprio. 
 */
userRouter.post("/get/tokenbalance", async function(req: Request, res: Response){
    await userController.getMyTokenBalance(req, res);
});
