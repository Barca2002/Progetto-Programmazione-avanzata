import { Router, Request, Response } from "express";

import { ImbarcazioneController } from "../controllers/ImbarcazioneController.js";
import { checkAdmin, checkUser } from "../middlewares/JWTMiddleware.js";

export const imbarcazioneRoutes = Router();
const imbarcazione = new ImbarcazioneController();

// GET tutte le imbarcazioni con le geofence associate (solo admin)
imbarcazioneRoutes.get("/geofences/all", checkAdmin, async function(req: Request, res: Response) {
    await imbarcazione.getAllImbarcazioniWithGeofences(req, res);
});

// GET imbarcazioni dell'utente loggato con geofence associate
imbarcazioneRoutes.get("/my", checkUser,  async function(req: Request, res: Response) {
    await imbarcazione.getMyImbarcazioniWithGeofences(req, res);
});

imbarcazioneRoutes.get("/segnalazioni/all", checkUser,  async function(req: Request, res: Response) {
    await imbarcazione.getAllWithSegnalazioni(req, res);
});

// GET imbarcazione per mmsi
imbarcazioneRoutes.get("/:mmsi", checkAdmin,  async function(req: Request, res: Response) {
    await imbarcazione.getImbarcazioneById(req, res);
});

// ASSOCIA PIU GEOAREAS A PIU IMBARCAZIONI (solo admin)
imbarcazioneRoutes.post("/geoareas/add", checkAdmin,  async function(req: Request, res: Response) {
    await imbarcazione.linkGeoareasToImbarcazioni(req, res);
});

// DISSOCIA UNA GEOAREA DA UNA IMBARCAZIONE (solo admin)
imbarcazioneRoutes.delete("/geoareas/delete", checkAdmin,  async function(req: Request, res: Response) {
    await imbarcazione.deleteGeoarea(req, res);
});

// CREATE imbarcazione (solo admin)
imbarcazioneRoutes.post("/create", checkAdmin,  async function(req: Request, res: Response) {
    await imbarcazione.createImbarcazione(req, res);
});

// UPDATE imbarcazione
imbarcazioneRoutes.patch("/update/:mmsi",  async function(req: Request, res: Response) {
    await imbarcazione.updateImbarcazione(req, res);
});

// DELETE imbarcazione
imbarcazioneRoutes.delete("/delete/:mmsi",  async function(req: Request, res: Response) {
    await imbarcazione.deleteImbarcazione(req, res);
});