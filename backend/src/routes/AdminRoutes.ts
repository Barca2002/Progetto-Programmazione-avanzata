import { Request, Response, Router } from "express";
import { AdminController } from "../controllers/AdminController.js";
import { checkAdminRole } from "../middlewares/JWTMiddleware.js";
import { tokenValidation } from "../middlewares/TokenMiddleware.js";
import { checkMmsi } from "../middlewares/ImbarcazioniMiddleware.js";
import { ImbarcazioneController } from "../controllers/ImbarcazioneController.js";
import { GeofenceAreaController } from "../controllers/GeofenceareaController.js";
import { checkGeoJson } from "../middlewares/GeofenceareaMiddleware.js";
import { registerValidationPipeline } from "../middlewares/AuthMiddleware.js";

export const adminRouter = Router();
const adminController = new AdminController();
const imbarcazioneController = new ImbarcazioneController();
const geofenceareaController = new GeofenceAreaController();

// Applichiamo i middleware definiti qui in tutte le rotte.
adminRouter.use(checkAdminRole);

// ----- ROTTE PER IL TESTING, NON RISCHIESTE NELLA TRACCIA DEL PROGETTO ----
// GET utente per id 
adminRouter.get("/utente/get/:id", async function(req: Request, res: Response){
    await adminController.getUserById(req, res);
});

// UPDATE utente per id
adminRouter.patch("/utente/update/:id", registerValidationPipeline, async function(req: Request, res: Response){
    await adminController.updateUser(req, res);
}); //con patch posso non mandare tutti i dati necessari per fare l'update, è meglio rispetto a put, perché put sostituisce l'intera istanza con i dati nuovi che inserisco.

// DELETE utente
adminRouter.delete("/utente/delete/:id", async function(req: Request, res: Response){
    await adminController.deleteUser(req, res);
});

adminRouter.get("/violazioni/mmsi/:mmsi", checkMmsi, async function(req: Request, res: Response){
    await adminController.getViolazioniByMmsi(req, res);
});

adminRouter.get("/violazioni/geoareaid/:geoarea_id", async function(req: Request, res: Response){
    await adminController.getViolazioniByGeoarea(req, res);
});

// GET tutte le segnalazioni di una geoarea
adminRouter.get("/segnalazioni/geoarea_id/:geoarea_id", async function(req: Request, res: Response){
    await adminController.getSegnalazioniByGeoarea(req, res);
});
// ---------------------------------------------------------

// Questa rotta permette di aggiungere dei token al saldo di un utente tramite la sua email.
// Il format della richiesta deve essere:
//  {
//      "newTokenAmount": <valore>,
//      "email": "<email>"
//  }
adminRouter.patch("/update/tokenbalance", tokenValidation, async function(req: Request, res: Response){
    await adminController.updateTokenBalance(req, res);
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
adminRouter.post("/imbarcazione/create",  async function(req: Request, res: Response) {
    await imbarcazioneController.createImbarcazione(req, res);
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
    await imbarcazioneController.linkGeoareasToImbarcazioni(req, res);
});

// Disassocia una geoarea ad un'imbarcazione (solo admin). Usiamo una POST, perché passiamo un body con i dati della richiesta, invece nella DELETE, come nella GET, si dovrebbe passare i dati tramite i query params.
// Il format della richiesta deve essere:
// {
//     "mmsi": <numero>,
//     "geoarea_id": <numero>
// }
adminRouter.post("/imbarcazione/geoarea/unlink",  async function(req: Request, res: Response) {
    await imbarcazioneController.unlinkGeoareasToImbarcazioni(req, res);
});

// GET tutti i punti delle imbarcazioni in base ad un intervallo temporale.
adminRouter.post("/imbarcazioni/positions",  async function(req: Request, res: Response) {
    await imbarcazioneController.getPointsAsGeoJson(req, res);
});

// GET status imbarcazioni, cioè se per ogni imarcazione, essa è dentro o fuori dalla geoarea specificata e con tempo di permanenza (se dentro).
adminRouter.get("/imbarcazioni/status/geoarea_id/:geoareaid",  async function(req: Request, res: Response) {
    await adminController.getAllImbarcazioniStatusPerGeoarea(req, res);
});


adminRouter.get("/imbarcazioni/segnalazioni/all",  async function(req: Request, res: Response) {
    await imbarcazioneController.getAllWithSegnalazioni(req, res);
});

// --------- ROTTE GEOFENCE AREA ------------------
// CREATE area (solo admin). Bisogna passare il contesto alla funzione altrimenti i this nella funzione createArea sono undefined

adminRouter.post("/geoarea/create", checkGeoJson, async function(req: Request, res: Response) {
  await geofenceareaController.createArea(req, res);
});

// GET tutte le imbarcazioni con le geofence associate (solo admin)
adminRouter.get("/imbarcazioni/geoaree/all", checkAdminRole, async function(req: Request, res: Response) {
    await imbarcazioneController.getAllImbarcazioniWithGeofenceareas(req, res);
});
