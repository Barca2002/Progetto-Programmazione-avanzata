import { Request, Response, Router } from "express";
import { AdminController } from "../controllers/AdminController.js";
import { checkAdminRole } from "../middlewares/JWTMiddleware.js";
import { validateTokenAmount } from "../middlewares/TokenMiddleware.js";
import { checkMmsi, validateImbarcazioneCreationBody } from "../middlewares/ImbarcazioniMiddleware.js";
import { checkCreation } from "../middlewares/GeofenceareaMiddleware.js";
import { validateDateFormat } from "../middlewares/DateMiddleware.js";

export const adminRouter = Router();
const adminController = new AdminController();

// Applichiamo i middleware definiti qui in tutte le rotte.
adminRouter.use(checkAdminRole);

// Questa rotta permette di aggiungere dei token al saldo di un utente tramite la sua email.
// Il format della richiesta deve essere:
//  {
//      "newTokenAmount": <valore>,
//      "email": "<email>"
//  }
adminRouter.patch("/update/tokenbalance", validateTokenAmount, async function(req: Request, res: Response){
    await adminController.updateTokenBalance(req, res);
});

adminRouter.get("/get/tokenbalance/:id", async function(req: Request, res: Response){
    await adminController.getTokenBalance(req, res);
});

// --------- ROTTE IMBARCAZIONI ----------------
// CREATE imbarcazione (solo admin)
// Il format della richiesta deve essere:
//  {
//   "mmsi": <numero>,
//   "name": <stringa>,
//   "type": <stringa>,
//   "descr": <stringa>,
//   "max_capacity": <numero>,
//   "user_id": <numero>
// }
adminRouter.post("/imbarcazione/create", validateImbarcazioneCreationBody, async function(req: Request, res: Response) {
    await adminController.createImbarcazione(req, res);
});

// Associa più geoareae a più imbarcazioni (solo admin). Si possono passare più dati e un mmsi può ricevere più geoaree.
// Il format della richiesta deve essere:
// [
//   {
//     "mmsi": <numero>,
//     "geoarea_ids": [<numero>, ...]
//   },
//   {
//     "mmsi": <numero>,
//     "geoarea_ids": [<numero>, ...]
//   },
//   ....
// ]
adminRouter.post("/imbarcazioni/geoaree/link",  async function(req: Request, res: Response) {
    await adminController.linkGeoareasToImbarcazioni(req, res);
});

// Disassocia una geoarea ad un'imbarcazione (solo admin). Usiamo una POST, perché passiamo un body con i dati della richiesta, invece nella DELETE, come nella GET, si dovrebbe passare i dati tramite i query params.
// Il format della richiesta deve essere:
// {
//     "mmsi": <numero>,
//     "geoarea_id": <numero>
// }
adminRouter.post("/imbarcazione/geoarea/unlink",  async function(req: Request, res: Response) {
    await adminController.unlinkGeoareasToImbarcazioni(req, res);
});

// GET tutti i punti delle imbarcazioni in base ad un intervallo temporale.
adminRouter.post("/imbarcazioni/positions", checkMmsi, validateDateFormat, async function(req: Request, res: Response) {
    await adminController.getPointsAsGeoJson(req, res);
});

// GET status imbarcazioni, cioè se per ogni imbarcazione, essa è dentro o fuori dalla geoarea specificata e con tempo di permanenza (se dentro).
adminRouter.get("/imbarcazioni/status/geoareaid/:geoareaid",  async function(req: Request, res: Response) {
    await adminController.getAllImbarcazioniStatusPerGeoarea(req, res);
});


adminRouter.get("/imbarcazioni/segnalazioni/all",  async function(req: Request, res: Response) {
    await adminController.getAllImbarcazioniWithSegnalazioni(req, res);
});

// GET tutte le imbarcazioni con le geofence associate
adminRouter.get("/imbarcazioni/geoaree/all", checkAdminRole, async function(req: Request, res: Response) {
    await adminController.getAllImbarcazioniWithGeofenceareas(req, res);
});

// --------- ROTTE GEOFENCE AREA ------------------

// CREATE area (solo admin).
adminRouter.post("/geoarea/create", checkCreation, async function(req: Request, res: Response) {
  await adminController.createGeofencearea(req, res);
});

