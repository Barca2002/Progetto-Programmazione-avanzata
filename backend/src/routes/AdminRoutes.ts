import { Request, Response, Router } from "express";
import { AdminController } from "../controllers/AdminController.js";
import { checkAdminRole } from "../middlewares/JWTMiddleware.js";
import { validateTokenAmount } from "../middlewares/TokenMiddleware.js";
import { checkLinkBody, checkUnlinkBody, validateImbarcazioneCreationBody } from "../middlewares/ImbarcazioniMiddleware.js";
import { checkCreation } from "../middlewares/GeofenceareaMiddleware.js";
import { validateDateFormat } from "../middlewares/DateMiddleware.js";

export const adminRouter = Router();
const adminController = new AdminController();

// Applichiamo i middleware definiti qui in tutte le rotte.
adminRouter.use(checkAdminRole);

/**
 * Rotta per l'aggiornamento dei token di un utente attraverso l'inserimento dell'email e di quanto si vuole ricaricare
 */
adminRouter.patch("/update/tokenbalance", validateTokenAmount, async function(req: Request, res: Response){
    await adminController.updateTokenBalance(req, res);
});

/**
 * Rotta per ritornare il credito residuo di un utente tramite l'inserimento nella rotta del suo id
 */
adminRouter.get("/get/tokenbalance/:id", async function(req: Request, res: Response){
    await adminController.getTokenBalance(req, res);
});

/** 
 * Rotta per la creazione di un'imbarcazione passando nel body della richiesta tutti i parametri necessari: mmsi, name, type, descr, max_capacity e lo user_id dell'utente proprietario di questa imbarcazione
*/
adminRouter.post("/imbarcazione/create", validateImbarcazioneCreationBody, async function(req: Request, res: Response) {
    await adminController.createImbarcazione(req, res);
});

/*
* Rotta per associare un imbarcazione a una o più geoaree, tramite l'inserimento nel body della richiesta dell'mmsi dell'imbarcazione e degli id delle geofence aree a cui si vuole associare l'imbarcazione. È possibile associare più imbarcazioni contemporaneamente nella stessa richiesta
*/
adminRouter.post("/imbarcazioni/geoaree/link", checkLinkBody, async function(req: Request, res: Response) {
    await adminController.linkGeoareasToImbarcazioni(req, res);
});

/**
 * Rotta per disassociare un imbarcazione da una geofence area associata tramite l'inserimento dell'mmsi e dell'id della geofence area da disassociare 
 */
adminRouter.post("/imbarcazione/geoarea/unlink", checkUnlinkBody, async function(req: Request, res: Response) {
    await adminController.unlinkGeoareaFromImbarcazione(req, res);
});

/**
 * Rotta per la ricerca delle posizioni di un'imbarcazione in un intervallo di date, restituite in formato GeoJSON. Riceve nel body della richiesta l'mmsi dell'imbarcazione e le date di inizio (start_date, obbligatoria) e fine (end_date, opzionale) dell'intervallo; se end_date non è specificata, viene utilizzata la data corrente.
 */
adminRouter.post("/imbarcazioni/get/positions", validateDateFormat, async function(req: Request, res: Response) {
    await adminController.getPositionsInDateRange(req, res);
});

/**
 * Rotta per tornare lo stato (DENTRO o FUORI) di tutte le imbarcazioni rispetto ad una geofence area, di cui viene passato l'id come parametro nella rotta, tornando anche, solo nel caso di stato = DENTRO, il tempo di permanenza nella geofence area
 */
adminRouter.get("/imbarcazioni/status/geoareaid/:geoareaid", async function(req: Request, res: Response) {
    await adminController.getAllImbarcazioniStatusByGeoarea(req, res);
});

/**
 * Rotta per tornare tutte le imbarcazioni con segnalazioni, specificando per ognuna il rispettivo stato, se RIENTRATA o IN CORSO
 */
adminRouter.post("/imbarcazioni/segnalazioni/get/all", async function(req: Request, res: Response) {
    await adminController.getAllImbarcazioniWithSegnalazioni(req, res);
});


/**
 * Rotta per tornare tutte le imbarcazioni e le geofence areas rispettivamente associate
 */
adminRouter.post("/imbarcazioni/geoaree/get/all", async function(req: Request, res: Response) {
    await adminController.getAllImbarcazioniWithGeofenceareas(req, res);
});

/**
 * Rotta per la creazione di una geofence area, inserendo nel body la struttura in formato GeoJson della geofence area, inserendo nel campo "properties" il nome dell'area obbligatoriamente e opzionalmente la max_speed
 */
adminRouter.post("/geoarea/create", checkCreation, async function(req: Request, res: Response) {
  await adminController.createGeofencearea(req, res);
});

