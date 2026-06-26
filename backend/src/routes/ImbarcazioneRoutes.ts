import { Router, Request, Response } from "express";

import { ImbarcazioneController } from "../controllers/ImbarcazioneController.js";
import { checkAdminRole, checkUserRole } from "../middlewares/JWTMiddleware.js";

export const imbarcazioneRoutes = Router();
const imbarcazione = new ImbarcazioneController();

// GET tutte le imbarcazioni con le geofence associate (solo admin)
imbarcazioneRoutes.get("/all", checkAdminRole, async function(req: Request, res: Response) {
    await imbarcazione.getAllImbarcazioniWithGeofences(req, res);
});

// GET imbarcazioni dell'utente loggato con geofence associate
imbarcazioneRoutes.get("/my", checkUserRole,  async function(req: Request, res: Response) {
    await imbarcazione.getMyImbarcazioniWithGeofences(req, res);
});

imbarcazioneRoutes.get("/segnalazioni/all", checkUserRole,  async function(req: Request, res: Response) {
    await imbarcazione.getAllWithSegnalazioni(req, res);
});

imbarcazioneRoutes.get("/location", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazione.getLocationPerGeoarea(req, res);
});

imbarcazioneRoutes.get("/positions", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazione.getPosizioniImbarcazione(req, res);
});

// GET imbarcazione per mmsi
imbarcazioneRoutes.get("/:mmsi", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazione.getImbarcazioneByMmsi(req, res);
});

// ASSOCIA PIU GEOAREAS A PIU IMBARCAZIONI (solo admin)
imbarcazioneRoutes.post("/geoareas/add", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazione.linkGeoareasToImbarcazioni(req, res);
});

// DISSOCIA UNA GEOAREA DA UNA IMBARCAZIONE (solo admin)
imbarcazioneRoutes.delete("/geoareas/delete", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazione.deleteGeoarea(req, res);
});

// CREATE imbarcazione (solo admin)
imbarcazioneRoutes.post("/create", checkAdminRole,  async function(req: Request, res: Response) {
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