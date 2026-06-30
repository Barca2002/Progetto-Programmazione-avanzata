import { Request, Response, Router } from "express";
import { AdminController } from "../controllers/AdminController.js";
import { checkAdminRole } from "../middlewares/JWTMiddleware.js";
import { tokenValidation } from "../middlewares/TokenMiddleware.js";
import { checkMmsi } from "../middlewares/ImbarcazioniMiddleware.js";

export const adminRouter = Router();
const adminController = new AdminController();

// Applichiamo i middleware definiti qui in tutte le rotte.
adminRouter.use(checkAdminRole);

// GET tutti utenti
adminRouter.get("/all", async function(req: Request, res: Response){
    await adminController.getUsers(req, res);
});

// GET utente per ID
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

// Questa rotta permette di settare il saldo dei token di un utente.
// Il format della richiesta deve essere:
//  {
//      newTokenAmount: <valore>,
//      email: "<email>"
//  }
adminRouter.patch("/updateTokenBalance", tokenValidation, async function(req: Request, res: Response){
    await adminController.updateTokenBalance(req, res);
});

adminRouter.get("/checkViolazioni/mmsi/:mmsi", checkMmsi, async function(req: Request, res: Response){
    await adminController.getViolazioniByMmsi(req, res);
});

adminRouter.get("/checkViolazioni/geoarea/:geoarea_id", checkAdminRole, async function(req: Request, res: Response){
    await adminController.getViolazioniByGeoarea(req, res);
});

adminRouter.get("/checkSegnalazioni/:geoarea_id", async function(req: Request, res: Response){
    await adminController.getSegnalazioniByGeoarea(req, res);
});

adminRouter.post("/creaViolazione", async function(req: Request, res: Response){
    await adminController.createViolazione(req, res);
});

// GET imbarcazioni che sono dentro o fuori dalle geoaree con tempo di permanenza (se dentro).
adminRouter.get("/location/:geoarea_id", checkAdminRole,  async function(req: Request, res: Response) {
    await adminController.getAllImbarcazioniStatusPerGeoarea(req, res);
});
