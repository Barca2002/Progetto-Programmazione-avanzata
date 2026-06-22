import { Router } from "express";

import { AdminController } from "../controllers/AdminController.js";
import { checkAdmin } from "../middlewares/JWTMiddleware.js";

export const adminRoutes = Router();
const adminController = new AdminController();

// GET tutti utenti
adminRoutes.get("/all", checkAdmin, adminController.getUtenti);

// GET utente per ID
adminRoutes.get("/:id", checkAdmin, adminController.getUtenteById);

// UPDATE utente
adminRoutes.patch("/update/:id", checkAdmin, adminController.updateUtente); //con patch posso non mandare tutti i dati necessari per fare l'update, è meglio rispetto a put, perchè put sostituisce l'intera istanza con i dati nuovi che inserisco.

// DELETE utente
adminRoutes.delete("/delete/:id", checkAdmin, adminController.deleteUtente);

