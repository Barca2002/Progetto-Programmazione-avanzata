import { Request, Response, NextFunction, Router } from "express";
import { GeofenceAreaController } from "../controllers/GeofenceareaController.js";
import { checkAdmin } from "../middlewares/JWTMiddleware.js";
import { geoJsonValidation } from "../middlewares/GeofenceareaMiddleware.js";


export const geofenceareaRoutes = Router();
const geofencearea = new GeofenceAreaController();

// GET tutte le aree
geofenceareaRoutes.get("/all", checkAdmin, geofencearea.getAree);

// GET area per ID
geofenceareaRoutes.get("/:id", checkAdmin, geofencearea.getAreaById);

// CREATE area (solo admin). Bisogna passare il contesto alla funzione altrimenti i this nella funzione creatArea sono undefined
geofenceareaRoutes.post("/create", checkAdmin, geoJsonValidation, function(req: Request, res: Response, next: NextFunction) {
    geofencearea.createArea(req, res, next);
  }
);

// UPDATE area (solo admin)
geofenceareaRoutes.patch("/update/:id", checkAdmin, geofencearea.updateArea);

// DELETE area (solo admin)
geofenceareaRoutes.delete("/delete/:id", checkAdmin, geofencearea.deleteArea);