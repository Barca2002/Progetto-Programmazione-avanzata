import { Router, Request, Response } from "express";

import { ImbarcazioneController } from "../controllers/ImbarcazioneController.js";
import { checkAdminRole, checkUserRole } from "../middlewares/JWTMiddleware.js";

export const imbarcazioneRouter = Router();
const imbarcazioneController = new ImbarcazioneController();


// GET imbarcazione per mmsi
imbarcazioneRouter.get("/:mmsi", checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazioneController.getImbarcazioneByMmsi(req, res);
});

// UPDATE imbarcazione
imbarcazioneRouter.patch("/update/:mmsi",  async function(req: Request, res: Response) {
    await imbarcazioneController.updateImbarcazione(req, res);
});

// DELETE imbarcazione
imbarcazioneRouter.delete("/delete/:mmsi",  async function(req: Request, res: Response) {
    await imbarcazioneController.deleteImbarcazione(req, res);
});