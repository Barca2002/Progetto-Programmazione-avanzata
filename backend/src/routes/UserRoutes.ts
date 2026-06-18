import { Router } from "express";

import {
  getUtenti,
  getUtenteById,
  createUtente,
  updateUtente,
  deleteUtente
} from "../controllers/UserController.js";

export const userRoutes = Router();

// GET tutti utenti
userRoutes.get("/all", getUtenti);

// GET utente per ID
userRoutes.get("/:id", getUtenteById);

// CREATE utente
userRoutes.post("/create", createUtente);

// UPDATE utente
userRoutes.put("/update/:id", updateUtente);

// DELETE utente
userRoutes.delete("/delete/:id", deleteUtente);

