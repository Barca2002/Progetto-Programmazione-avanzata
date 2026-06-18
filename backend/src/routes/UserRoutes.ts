import { Router } from "express";

import { UserController } from "../controllers/UserController.js";

export const userRoutes = Router();
const userController = new UserController();

// GET tutti utenti
userRoutes.get("/all", userController.getUtenti);

// GET utente per ID
userRoutes.get("/:id", userController.getUtenteById);

// CREATE utente
userRoutes.post("/create", userController.createUtente);

// UPDATE utente
userRoutes.put("/update/:id", userController.updateUtente);

// DELETE utente
userRoutes.delete("/delete/:id", userController.deleteUtente);

