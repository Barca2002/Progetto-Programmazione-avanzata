import { Position } from "geojson";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum } from "../utils/StatusMessages.js";
import { NextFunction, Request, Response } from "express";
import * as z from "zod";
import * as turf from "@turf/turf";
import { hasMaxDecimals } from "../utils/DecimalChecker.js";

export const checkGeoJson = [checkGeoJsonFormat, checkCoordinates];
export const MAX_POINTS = 15;

// Definizione dello schema di validazione per il formato GeoJSON
const geofenceAreaSchema = z.object({
    type: z.literal("FeatureCollection"),
    features: z.array(
        z.object({
            type: z.literal("Feature"),
            // Properties, nel nostro caso, deve contenere il campo name ed opzionalmente il campo max_speed (max 200km/h).
            properties: z.object({
                name: z.string().min(3).max(255),
                max_speed: z.number().min(1).max(200).optional()
            }),
            geometry: z.object({
                type: z.literal("Polygon"),
                // Le coordinate sono: [[[long, lat], [long, lat], ...]]
                // Controlliamo anche che i numeri decimali non superino il massimo consentito
                coordinates: z.array(
                    z.array(z.tuple([z.number().min(-180).max(180).refine(hasMaxDecimals),  // longitude
                            z.number().min(-90).max(90).refine
                    (hasMaxDecimals)// latitude
                    ]))
                )
            }),
        })
    ),
    
}).strict();

// Controllo del formato della richiesta tramite zod
function checkGeoJsonFormat(req: Request, res: Response, next: NextFunction){
    const result = geofenceAreaSchema.safeParse(req.body);
    if (!result.success){
        throw ErrorFactory.getError(AppErrorEnum.INVALID_GEOJSON_FORMAT);
    }
    console.log("Controllo formato geojson superato con successo.");
    // Controllo del contenuto delle coordinate
    next();
}

function checkCoordinates(req: Request, res: Response, next: NextFunction) {
    // Le coordinate deve essere un array di Position, cioè coppie di latitudine e longitudine. Lo standard impone questo tipo.
    const coordinates: Position[][] = req.body?.features[0].geometry.coordinates;
    const punti = coordinates[0]; // Prendiamo l'array di punti
    if (!coordinates || !punti){
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_COORDS);
    }
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
    if (punti.length < 4 ) {
        throw ErrorFactory.getError(AppErrorEnum.TOO_LITTLE_POINTS); 
    }
    if (punti.length > MAX_POINTS){
        throw ErrorFactory.getError(AppErrorEnum.TOO_MANY_POINTS);
    }
    // Controllo che il primo e l'ultimo punto coincidono per chiudere l'area
    const primoPunto = punti[0];
    const ultimoPunto = punti[punti.length - 1];

    if (!primoPunto || !ultimoPunto || primoPunto[0] !== ultimoPunto[0] || primoPunto[1] !== ultimoPunto[1]) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_COORDS);
    }
    // Con turf controlliamo se ci sono punti di sovrapposizione nel poligono
    // Definito dalle coordinare.
    const polygon = turf.polygon(coordinates);
    const kinks = turf.kinks(polygon);
    // kinks contiene il numero di punti di autointersezione, quindi se ce ne sta uno o più, allora il poligono ha dei tratti che s'intersecano
    if (kinks.features.length > 0){
        throw ErrorFactory.getError(AppErrorEnum.OVERLAPPING_POLYGON);
    }    

    // Ritorna il controllo al controller
    next();
}

