import { Request, Response, Router } from "express";

import { AdminController } from "../controllers/AdminController.js";
import { checkAdmin } from "../middlewares/JWTMiddleware.js";

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

