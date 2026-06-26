import { Request, Response, Router } from "express";
import { GeofenceAreaController } from "../controllers/GeofenceareaController.js";
import { checkAdminRole } from "../middlewares/JWTMiddleware.js";
import { checkGeoJson } from "../middlewares/GeofenceareaMiddleware.js";


export const geofenceareaRouter = Router();
const geofencearea = new GeofenceAreaController();

geofenceareaRouter.use(checkAdminRole);

// GET tutte le aree
geofenceareaRouter.get("/all", async function(req: Request, res: Response){
  await geofencearea.getAree(req, res); 
});

// GET area per ID
geofenceareaRouter.get("/:id", async function(req: Request, res: Response){
  await geofencearea.getAreaById(req, res);
});

// CREATE area (solo admin). Bisogna passare il contesto alla funzione altrimenti i this nella funzione createArea sono undefined
geofenceareaRouter.post("/create", checkGeoJson, async function(req: Request, res: Response) {
  await geofencearea.createArea(req, res);
});

// UPDATE area (solo admin)
geofenceareaRouter.patch("/update/:id", async function(req: Request, res: Response){
  await geofencearea.updateArea(req, res);
});

// DELETE area (solo admin)
geofenceareaRouter.delete("/delete/:id", async function(req: Request, res: Response){
  await geofencearea.deleteArea(req, res);
});