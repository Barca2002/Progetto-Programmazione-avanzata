import { Request, Response, Router } from "express";
import { GeofenceAreaController } from "../controllers/GeofenceareaController.js";
import { checkAdminRole } from "../middlewares/JWTMiddleware.js";
import { checkGeoJsonUpdate } from "../middlewares/GeofenceareaMiddleware.js";


export const geofenceareaRouter = Router();
const geofencearea = new GeofenceAreaController();

geofenceareaRouter.use(checkAdminRole);

// UPDATE area (solo admin)
geofenceareaRouter.patch("/update/:id", checkGeoJsonUpdate, async function(req: Request, res: Response){
  await geofencearea.updateArea(req, res);
});

// DELETE area (solo admin)
geofenceareaRouter.delete("/delete/:id", async function(req: Request, res: Response){
  await geofencearea.deleteArea(req, res);
});