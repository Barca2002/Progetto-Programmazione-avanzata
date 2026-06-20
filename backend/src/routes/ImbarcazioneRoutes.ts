import { Router } from "express";

import { ImbarcazioneController } from "../controllers/ImbarcazioneController.js";
import { JWTMiddleware } from "../middlewares/JWTMiddleware.js";

export const imbarcazioneRoutes = Router();
const imbarcazione = new ImbarcazioneController();

// GET tutte le imbarcazioni
imbarcazioneRoutes.get("/all", imbarcazione.getImbarcazioni);

// GET imbarcazione per mmsi
imbarcazioneRoutes.get("/:mmsi", imbarcazione.getImbarcazioneById);

// CREATE imbarcazione (solo admin)
imbarcazioneRoutes.post("/create", JWTMiddleware, imbarcazione.createImbarcazione);

// UPDATE imbarcazione
imbarcazioneRoutes.put("/update/:mmsi", imbarcazione.updateImbarcazione);

// DELETE imbarcazione
imbarcazioneRoutes.delete("/delete/:mmsi", imbarcazione.deleteImbarcazione);