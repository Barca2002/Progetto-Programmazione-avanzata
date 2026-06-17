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
userRoutes.get("/utentiAll", getUtenti);

// GET utente per ID
userRoutes.get("/utenti/:id", getUtenteById);

// CREATE utente
userRoutes.post("/utente", createUtente);

// UPDATE utente
userRoutes.put("/utentiUpdate/:id", updateUtente);

// DELETE utente
userRoutes.delete("/utentiDelete/:id", deleteUtente);

