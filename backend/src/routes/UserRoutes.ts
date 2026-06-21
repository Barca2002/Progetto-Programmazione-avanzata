import { Router } from "express";

//import { UserController } from "../controllers/UserController.js";
import { checkUser } from "../middlewares/JWTMiddleware.js";

export const userRoutes = Router();
//const userController = new UserController();

// Invio dati istantanei 
//userRoutes.get("/sendData", checkUser, userController.sendData);

