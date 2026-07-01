import { Router, Request, Response } from "express";
import { ImbarcazioneController } from "../controllers/ImbarcazioneController.js";
import { checkAdminRole } from "../middlewares/JWTMiddleware.js";
import { checkMmsi, imbarcazioneUpdateValidation } from "../middlewares/ImbarcazioniMiddleware.js";

export const imbarcazioneRouter = Router();
const imbarcazioneController = new ImbarcazioneController();


// GET imbarcazione per mmsi
imbarcazioneRouter.get("/:mmsi", checkMmsi, checkAdminRole,  async function(req: Request, res: Response) {
    await imbarcazioneController.getImbarcazioneByMmsi(req, res);
});

// UPDATE imbarcazione
imbarcazioneRouter.patch("/update/:mmsi", imbarcazioneUpdateValidation, async function(req: Request, res: Response) {
    await imbarcazioneController.updateImbarcazione(req, res);
});

// DELETE imbarcazione
imbarcazioneRouter.delete("/delete/:mmsi", checkMmsi, async function(req: Request, res: Response) {
    await imbarcazioneController.deleteImbarcazione(req, res);
});