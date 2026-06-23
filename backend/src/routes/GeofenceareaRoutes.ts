import { Router } from "express";
import { GeofenceAreaController } from "../controllers/GeofenceareaController.js";
import { checkAdmin } from "../middlewares/JWTMiddleware.js";
import { geoJsonValidation } from "../middlewares/GeofenceareaMiddleware.js"

export const geofenceareaRoutes = Router();
const geofencearea = new GeofenceAreaController();

// GET tutte le aree
geofenceareaRoutes.get("/all", checkAdmin, geofencearea.getAree);

// GET area per ID
geofenceareaRoutes.get("/:id", checkAdmin, geofencearea.getAreaById);

// CREATE area (solo admin).
geofenceareaRoutes.post("/create", checkAdmin, geoJsonValidation, geofencearea.createArea);

// UPDATE area (solo admin)
geofenceareaRoutes.patch("/update/:id", checkAdmin, geofencearea.updateArea);

// DELETE area (solo admin)
geofenceareaRoutes.delete("/delete/:id", checkAdmin, geofencearea.deleteArea);