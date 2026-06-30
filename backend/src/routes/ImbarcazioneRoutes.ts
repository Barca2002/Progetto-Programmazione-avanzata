import { Router, Request, Response } from "express";

import { ImbarcazioneController } from "../controllers/ImbarcazioneController.js";
import { checkAdminRole, checkUserRole } from "../middlewares/JWTMiddleware.js";

export const imbarcazioneRouter = Router();
const imbarcazioneController = new ImbarcazioneController();

imbarcazioneRouter.get("/segnalazioni/all", checkUserRole,  async function(req: Request, res: Response) {
    await imbarcazioneController.getAllWithSegnalazioni(req, res);
});


// GET tutti i punti delle imbarcazioni in base ad un intervallo temporale.
imbarcazioneRouter.get("/positions", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazioneController.getPointsAsGeoJson(req, res);
});

// GET imbarcazione per mmsi
imbarcazioneRouter.get("/:mmsi", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazioneController.getImbarcazioneByMmsi(req, res);
});

// ASSOCIA PIU GEOAREAS A PIU IMBARCAZIONI (solo admin)
imbarcazioneRouter.post("/geoareas/add", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazioneController.linkGeoareasToImbarcazioni(req, res);
});

// UPDATE imbarcazione
imbarcazioneRouter.patch("/update/:mmsi",  async function(req: Request, res: Response) {
    await imbarcazioneController.updateImbarcazione(req, res);
});

// DELETE imbarcazione
imbarcazioneRouter.delete("/delete/:mmsi",  async function(req: Request, res: Response) {
    await imbarcazioneController.deleteImbarcazione(req, res);
});