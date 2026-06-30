import { Request, Response, Router } from "express";
import { AdminController } from "../controllers/AdminController.js";
import { checkAdminRole } from "../middlewares/JWTMiddleware.js";
import { tokenValidation } from "../middlewares/TokenMiddleware.js";
import { checkMmsi } from "../middlewares/ImbarcazioniMiddleware.js";
import { ImbarcazioneController } from "../controllers/ImbarcazioneController.js";
import { GeofenceAreaController } from "../controllers/GeofenceareaController.js";
import { checkGeoJson } from "../middlewares/GeofenceareaMiddleware.js";

export const adminRouter = Router();
const adminController = new AdminController();
const imbarcazioneController = new ImbarcazioneController();
const geofenceareaController = new GeofenceAreaController();

// Applichiamo i middleware definiti qui in tutte le rotte.
adminRouter.use(checkAdminRole);

// ----- ROTTE PER IL TESTING, NON RISCHIESTE NELLA TRACCIA DEL PROGETTO ----
// GET utente per id 
adminRouter.get("/:id", async function(req: Request, res: Response){
    await adminController.getUserById(req, res);
});
// UPDATE utente
adminRouter.patch("/update/:id", async function(req: Request, res: Response){
    await adminController.updateUser(req, res);
}); //con patch posso non mandare tutti i dati necessari per fare l'update, è meglio rispetto a put, perché put sostituisce l'intera istanza con i dati nuovi che inserisco.

// DELETE utente
adminRouter.delete("/delete/:id", async function(req: Request, res: Response){
    await adminController.deleteUser(req, res);
});

adminRouter.get("/violazioni/mmsi/:mmsi", checkMmsi, async function(req: Request, res: Response){
    await adminController.getViolazioniByMmsi(req, res);
});

adminRouter.get("/violazioni/geoareaid/:geoarea_id", checkAdminRole, async function(req: Request, res: Response){
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

// GET status imbarcazioni, cioè se per ogni imarcazione, essa è dentro o fuori dalla geoarea specificata e con tempo di permanenza (se dentro).
adminRouter.get("/imbarcazioni/status/geoarea_id/:geoareaid", checkAdminRole,  async function(req: Request, res: Response) {
    await adminController.getAllImbarcazioniStatusPerGeoarea(req, res);
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
adminRouter.post("/imbarcazione/create", checkAdminRole,  async function(req: Request, res: Response) {
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
adminRouter.post("/imbarcazioni/geoaree/link", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazioneController.linkGeoareasToImbarcazioni(req, res);
});

// Disassocia una geoarea ad un'imbarcazione (solo admin).
// Il format della richiesta deve essere:
// {
//     "mmsi": <numero>,
//     "geoarea_id": <numero>
// }
adminRouter.delete("/imbarcazione/geoarea/unlink", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazioneController.unlinkGeoareasToImbarcazioni(req, res);
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
