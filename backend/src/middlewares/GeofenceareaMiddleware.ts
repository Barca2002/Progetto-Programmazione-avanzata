import { Position } from "geojson";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import { NextFunction, Request, Response } from "express";
import * as z from "zod";
import * as turf from "@turf/turf";

export const checkGeoJson = [checkGeoJsonFormat, checkCoordinates];
export const MAX_POINTS = 15;

// Definizione dello schema di validazione per il formato GeoJSON
const geofenceAreaSchema = z.object({
    name: z.string().min(3, "Il nome dell'area è obbligatorio!"),
    coordinates: z.array(z.array(
            z.tuple([z.number(), z.number()]))).min(4)// Forza la struttura [longitudine, latitudine] di tipo number
});

// Controllo del formato della richiesta tramite zod
function checkGeoJsonFormat(req: Request, res: Response, next: NextFunction){
    const result = geofenceAreaSchema.safeParse(req.body);
    if (!result){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_GEOJSON_FORMAT);
    }
    console.log("Controllo formato geojson superato con successo.");
    // Controllo del contenuto delle coordinate
    next();
}

function checkCoordinates(req: Request, res: Response, next: NextFunction) {
    // Le coordinate deve essere un array di Position, cioè coppie di latitudine e longitudine. Lo standard impone questo tipo.
    const coordinates: Position[] = req.body?.coordinates;

    // Bisogna controllare 3 cose principali:
    // - Le coordinate devono contenere almeno 4 punti (per creare un triangolo
    //   servono 3 punti + l'ultimo che si sovrappone al primo).
    // - L'ultimo punto ed il primo devono essere uguali per chiudere il poligono
    // - Le linee del poligono non possono intersecarsi.

    // Controllo che coordinates sia un array e che i punti siano un array (cioè coordinates[0])
    if (!Array.isArray(coordinates) || !Array.isArray(coordinates[0])) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA);
    }

    // Ci devono essere minimo 4 punti e massimo MAX_POINTS punti per definire una geofence area.    
    if (coordinates.length < 4 ) {
        throw ErrorFactory.getError(AppErrorEnum.TOO_LITTLE_POINTS); 
    }
    if (coordinates.length > MAX_POINTS){
        throw ErrorFactory.getError(AppErrorEnum.TOO_MANY_POINTS);
    }
    const wrap: Position[][] = [coordinates]; //perchè dall'input prendiamo uno strato in meno per semplicità, quindi qui lo si wrappa

    // Con turf controlliamo se ci sono punti di sovrapposizione nel poligono
    // Definito dalle coordinare.
    const polygon = turf.polygon(wrap);
    const kinks = turf.kinks(polygon);
    // Se c'è almeno un punto in cui si sovrappone, lancia un'eccezione
    if (kinks.features.length > 0) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_COORDS);
    }
    
    // Controllo che il primo e l'ultimo punto coincidono per chiudere l'area
    const primoPunto = coordinates[0];
    const ultimoPunto = coordinates[coordinates.length - 1];

    if (!primoPunto || !ultimoPunto || primoPunto[0] !== ultimoPunto[0] || primoPunto[1] !== ultimoPunto[1]) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_COORDS);
    }

    // Ritorna il controllo al controller
    next();
}

