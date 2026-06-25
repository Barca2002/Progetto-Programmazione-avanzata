import { Request, Response, Router } from "express";
import { AdminController } from "../controllers/AdminController.js";
import { checkAdmin } from "../middlewares/JWTMiddleware.js";
import { tokenValidation } from "../middlewares/TokenMiddleware.js";
import { checkMmsi } from "../middlewares/ImbarcazioniMiddleware.js";

export const adminRoutes = Router();
const adminController = new AdminController();

// GET tutti utenti
adminRoutes.get("/all", checkAdmin, async function(req: Request, res: Response){
    await adminController.getUtenti(req, res);
});

// GET utente per ID
adminRoutes.get("/:id", checkAdmin, async function(req: Request, res: Response){
    await adminController.getUtenteById(req, res);
});
// UPDATE utente
adminRoutes.patch("/update/:id", checkAdmin, async function(req: Request, res: Response){
    await adminController.updateUtente(req, res);
}); //con patch posso non mandare tutti i dati necessari per fare l'update, è meglio rispetto a put, perchè put sostituisce l'intera istanza con i dati nuovi che inserisco.

// DELETE utente
adminRoutes.delete("/delete/:id", checkAdmin, async function(req: Request, res: Response){
    await adminController.deleteUtente(req, res);
});


// Questa rotta permette di settare il saldo dei token di un utente.
// Il format della richiesta deve essere:
//  {
//      newTokenAmount: <valore>,
//      email: "<email>"
//  }
adminRoutes.patch("/updateTokenBalance", checkAdmin, tokenValidation, async function(req: Request, res: Response){
    await adminController.updateTokenBalance(req, res);
});

adminRoutes.get("/checkSegnalazioni/:mmsi", checkMmsi, async function(req: Request, res: Response){
    await adminController.checkViolazioniByMmsi(req, res);
});
