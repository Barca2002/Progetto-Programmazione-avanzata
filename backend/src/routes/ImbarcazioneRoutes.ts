import { Router } from "express";

import { ImbarcazioneController } from "../controllers/ImbarcazioneController.js";
import { checkAdmin, checkUser } from "../middlewares/JWTMiddleware.js";

export const imbarcazioneRoutes = Router();
const imbarcazione = new ImbarcazioneController();

// GET tutte le imbarcazioni con le geofence associate (solo admin)
imbarcazioneRoutes.get("/geofences", checkAdmin, imbarcazione.getAllImbarcazioniWithGeofences);

// GET imbarcazioni dell'utente loggato con geofence associate
imbarcazioneRoutes.get("/my/geofences", checkUser, imbarcazione.getMyImbarcazioniWithGeofences);

// GET tutte le imbarcazioni
imbarcazioneRoutes.get("/all", imbarcazione.getImbarcazioni);

// GET imbarcazione per mmsi
imbarcazioneRoutes.get("/:mmsi", imbarcazione.getImbarcazioneById);

// CREATE imbarcazione (solo admin)
imbarcazioneRoutes.post("/create", checkAdmin, imbarcazione.createImbarcazione);

// UPDATE imbarcazione
imbarcazioneRoutes.put("/update/:mmsi", imbarcazione.updateImbarcazione);

// DELETE imbarcazione
imbarcazioneRoutes.delete("/delete/:mmsi", imbarcazione.deleteImbarcazione);