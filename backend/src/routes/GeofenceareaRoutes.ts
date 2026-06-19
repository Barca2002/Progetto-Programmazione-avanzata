import { Router } from "express";

import { GeofenceAreaController } from "../controllers/GeofenceareaController.js";

export const geofenceareaRoutes = Router();
const geofencearea = new GeofenceAreaController();

// GET tutte le aree
geofenceareaRoutes.get("/all", geofencearea.getAree);

// GET area per ID
geofenceareaRoutes.get("/:id", geofencearea.getAreaById);

// UPDATE area
geofenceareaRoutes.put("/update/:id", geofencearea.updateArea);

// DELETE area
geofenceareaRoutes.delete("/delete/:id", geofencearea.deleteArea);