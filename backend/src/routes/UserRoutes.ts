import { Router } from "express";

import {
  getUtenti,
  getUtenteById,
  createUtente,
  updateUtente,
  deleteUtente
} from "../controllers/UserController.js";

export const UserRoutes = Router();

// GET tutti utenti
UserRoutes.get("/utentiAll", getUtenti);

// GET utente per ID
UserRoutes.get("/utenti/:id", getUtenteById);

// CREATE utente
UserRoutes.post("/utente", createUtente);

// UPDATE utente
UserRoutes.put("/utentiUpdate/:id", updateUtente);

// DELETE utente
UserRoutes.delete("/utentiDelete/:id", deleteUtente);

