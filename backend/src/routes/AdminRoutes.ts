import { Router } from "express";

import { AdminController } from "../controllers/AdminController.js";

export const adminRoutes = Router();
const adminController = new AdminController();

// GET tutti utenti
adminRoutes.get("/all", adminController.getUtenti);

// GET utente per ID
adminRoutes.get("/:id", adminController.getUtenteById);

// UPDATE utente
adminRoutes.put("/update/:id", adminController.updateUtente);

// DELETE utente
adminRoutes.delete("/delete/:id", adminController.deleteUtente);

