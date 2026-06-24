import { Request, Response, Router } from "express";
import { GeofenceAreaController } from "../controllers/GeofenceareaController.js";
import { checkAdmin } from "../middlewares/JWTMiddleware.js";
import { checkGeoJson } from "../middlewares/GeofenceareaMiddleware.js";


export const geofenceareaRoutes = Router();
const geofencearea = new GeofenceAreaController();

// GET tutte le aree
geofenceareaRoutes.get("/all", checkAdmin, async function(req: Request, res: Response){
  await geofencearea.getAree(req, res); 
});

// GET area per ID
geofenceareaRoutes.get("/:id", checkAdmin, async function(req: Request, res: Response){
  await geofencearea.getAreaById(req, res);
});

// CREATE area (solo admin). Bisogna passare il contesto alla funzione altrimenti i this nella funzione createArea sono undefined
geofenceareaRoutes.post("/create", checkAdmin, checkGeoJson, async function(req: Request, res: Response) {
  await geofencearea.createArea(req, res);
});

// UPDATE area (solo admin)
geofenceareaRoutes.patch("/update/:id", checkAdmin, async function(req: Request, res: Response){
  await geofencearea.updateArea(req, res);
});

// DELETE area (solo admin)
geofenceareaRoutes.delete("/delete/:id", checkAdmin, async function(req: Request, res: Response){
  await geofencearea.deleteArea(req, res);
});