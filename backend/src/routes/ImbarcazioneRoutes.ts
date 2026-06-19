import { Router } from "express";

import { ImbarcazioneController } from "../controllers/ImbarcazioneController.js";

export const imbarcazioneRoutes = Router();
const imbarcazione = new ImbarcazioneController();

// GET tutte le imbarcazioni
imbarcazioneRoutes.get("/all", imbarcazione.getImbarcazioni);

// GET imbarcazione per mmsi
imbarcazioneRoutes.get("/:mmsi", imbarcazione.getImbarcazioneById);

// UPDATE imbarcazione
imbarcazioneRoutes.put("/update/:mmsi", imbarcazione.updateImbarcazione);

// DELETE imbarcazione
imbarcazioneRoutes.delete("/delete/:mmsi", imbarcazione.deleteImbarcazione);