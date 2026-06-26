import { Router, Request, Response } from "express";

import { ImbarcazioneController } from "../controllers/ImbarcazioneController.js";
import { checkAdminRole, checkUserRole } from "../middlewares/JWTMiddleware.js";

export const imbarcazioneRouter = Router();
const imbarcazione = new ImbarcazioneController();

// GET tutte le imbarcazioni con le geofence associate (solo admin)
imbarcazioneRouter.get("/all", checkAdminRole, async function(req: Request, res: Response) {
    await imbarcazione.getAllImbarcazioniWithGeofences(req, res);
});

// GET imbarcazioni dell'utente loggato con geofence associate
imbarcazioneRouter.get("/my", checkUserRole,  async function(req: Request, res: Response) {
    await imbarcazione.getMyImbarcazioniWithGeofences(req, res);
});

imbarcazioneRouter.get("/segnalazioni/all", checkUserRole,  async function(req: Request, res: Response) {
    await imbarcazione.getAllWithSegnalazioni(req, res);
});

imbarcazioneRouter.get("/location", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazione.getLocationPerGeoarea(req, res);
});

imbarcazioneRouter.get("/positions", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazione.getPosizioniImbarcazione(req, res);
});

// GET imbarcazione per mmsi
imbarcazioneRouter.get("/:mmsi", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazione.getImbarcazioneByMmsi(req, res);
});

// ASSOCIA PIU GEOAREAS A PIU IMBARCAZIONI (solo admin)
imbarcazioneRouter.post("/geoareas/add", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazione.linkGeoareasToImbarcazioni(req, res);
});

// DISSOCIA UNA GEOAREA DA UNA IMBARCAZIONE (solo admin)
imbarcazioneRouter.delete("/geoareas/delete", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazione.deleteGeoarea(req, res);
});

// CREATE imbarcazione (solo admin)
imbarcazioneRouter.post("/create", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazione.createImbarcazione(req, res);
});

// UPDATE imbarcazione
imbarcazioneRouter.patch("/update/:mmsi",  async function(req: Request, res: Response) {
    await imbarcazione.updateImbarcazione(req, res);
});

// DELETE imbarcazione
imbarcazioneRouter.delete("/delete/:mmsi",  async function(req: Request, res: Response) {
    await imbarcazione.deleteImbarcazione(req, res);
});