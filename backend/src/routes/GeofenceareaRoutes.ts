import { Router } from "express";
import { GeofenceAreaController } from "../controllers/GeofenceareaController.js";
import { checkAdmin } from "../middlewares/JWTMiddleware.js";

export const geofenceareaRoutes = Router();
const geofencearea = new GeofenceAreaController();

// GET tutte le aree
geofenceareaRoutes.get("/all", geofencearea.getAree);

// GET area per ID
geofenceareaRoutes.get("/:id", geofencearea.getAreaById);

// CREATE area (solo admin)
geofenceareaRoutes.post("/create", checkAdmin, geofencearea.createArea);

// UPDATE area (solo admin)
geofenceareaRoutes.patch("/update/:id", checkAdmin, geofencearea.updateArea);

// DELETE area (solo admin)
geofenceareaRoutes.delete("/delete/:id", checkAdmin, geofencearea.deleteArea);