import { Position } from "geojson";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppErrorName } from "../utils/StatusMessages.js";
import { NextFunction, Request, Response } from "express";
import * as z from "zod";
import * as turf from "@turf/turf";
import { hasMaxDecimals } from "../utils/DecimalChecker.js";
import { isMissingIssueGeoJSON, validateBody, } from "../utils/HelperFunctions.js";

export const checkCreation = [checkGeoJsonFormat, checkCoordinates];
export const MAX_POINTS = 15;
export const MAX_SPEED_ALLOWED = 200;
export const MAX_NAME_LENGTH = 254;
export const MIN_NAME_LENGTH = 3;
// ==================== CREAZIONE ====================

// Per controllare la longitudine e latitudine delle posizioni, usiamo questo schema. ctx è il contesto e value è il dato che stiamo validando. superRefine(), a differenza di refine() che restituisce solo un booleano, permette di creare errori custom e fare validazione avanzata.
const PositionSchema = z.array(z.number()).superRefine((value, ctx) => {
    const [lon, lat] = value;
    if (value.length !== 2) {
        ctx.addIssue({
            code: "custom",
            message: "2_VALUES_ONLY",
            path: [],
        });
        return;
    }
    if (lon === undefined) {
        ctx.addIssue({
            code: "custom",
            message: "MISSING_LONG",
            path: [0],
        });
        return;
    }

    if (lat === undefined) {
        ctx.addIssue({
            code: "custom",
            message: "MISSING_LAT",
            path: [1],
        });
        return;
    }

    if (lon < -180 || lon > 180) {
        ctx.addIssue({
            code: "custom",
            message: "RANGE_NOT_ALLOWED_LONG",
            path: [0],
        });
        return;
    }

    if (lat < -90 || lat > 90) {
        ctx.addIssue({
            code: "custom",
            message: "RANGE_NOT_ALLOWED_LAT",
            path: [1],
        });
        return;
    }

    if (!hasMaxDecimals(lon)) {
        ctx.addIssue({
            code: "custom",
            message: "TOO_MANY_DECIMALS_LONG",
            path: [0],
        });
    }

    if (!hasMaxDecimals(lat)) {
        ctx.addIssue({
            code: "custom",
            message: "TOO_MANY_DECIMALS_LAT",
            path: [1],
        });
    }
});

// Definizione dello schema di validazione per il formato GeoJSON. strict() va messo us ogni z.object, altrimenti si possono inserire campi aggiuntivi nei vari pezzi del body della richiesta.
const geofenceAreaSchema = z.object({
    type: z.string().refine(v => v === "FeatureCollection"), // Non usiamo z.literal() perché sennò, in caso di parametro mancante, l'errore generato è invalid_value e non invalid_type, quindi non potevamo gestirlo con lo switch nella validazione.
    features: z.array(
        z.object({
            type: z.string().refine(v => v === "Feature"),
            properties: z.object({
                name: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
                max_speed: z.number().min(1).max(MAX_SPEED_ALLOWED).optional()
            }).strict(),
            geometry: z.object({
                type: z.string().refine(v => v === "Polygon"),
                // Le coordinate sono: [[[long, lat], [long, lat], ...]]
                // Controlliamo anche che i numeri decimali non superino il massimo consentito
                coordinates: z.array(
                    z.array(PositionSchema)
                )
            }).strict(),
        }).strict()
    ),
}).strict();

export function mapGeofenceAreaErrors(campo: string, issue: z.core.$ZodIssue, reqBody: any): AppErrorName {
   
    const missing = isMissingIssueGeoJSON(issue, reqBody);
    const pathString = issue.path.join(".");
    console.log("missing: ", missing)
    console.log("pathstring: ", pathString);
    if (issue.code === "unrecognized_keys") {
        return AppErrorEnum.INVALID_PARAMS;
    }


    if (issue.code === "invalid_type" && missing) {
        switch (pathString) {
            case "type": return AppErrorEnum.MISSING_TYPE_FEATURECOLLECTION;
            case "features.0.type": return AppErrorEnum.MISSING_TYPE_FEATURE;
            case "features.0.geometry.type": return AppErrorEnum.MISSING_TYPE_FEATURE_GEOMETRY;
            case "features": return AppErrorEnum.MISSING_FEATURES;
            case "features.0.properties": return AppErrorEnum.MISSING_PROPERTIES;
            case "features.0.properties.name": return AppErrorEnum.MISSING_NAME;
            case "features.0.geometry": return AppErrorEnum.MISSING_GEOMETRY;
            case "features.0.geometry.coordinates": return AppErrorEnum.MISSING_COORDINATES;
            default: return AppErrorEnum.MISSING_DATA;
        }
    }

    // Controllo basato sui messaggi custom impostati in PositionSchema, serve per le coordinate.
    if (issue.code === "custom") {
        switch (issue.message) {
            case "2_VALUES_ONLY": return AppErrorEnum.INVALID_POSITION_VALUES;
            case "MISSING_LONG": return AppErrorEnum.INVALID_LONGITUDINE_VALUE;
            case "MISSING_LAT": return AppErrorEnum.INVALID_LATITUDINE_VALUE;
            case "RANGE_NOT_ALLOWED_LONG": return AppErrorEnum.INVALID_LONGITUDINE_RANGE;
            case "RANGE_NOT_ALLOWED_LAT": return AppErrorEnum.INVALID_LATITUDINE_RANGE;
            case "TOO_MANY_DECIMALS_LONG": return AppErrorEnum.INVALID_LONGITUDINE_DECIMALS;
            case "TOO_MANY_DECIMALS_LAT": return AppErrorEnum.INVALID_LATITUDINE_DECIMALS;
        }
    }

    // Fallback finale sul path generico
    switch (pathString) {
        case "type": return AppErrorEnum.INVALID_TYPE_FEATURECOLLECTION;
        case "features.0.type": return AppErrorEnum.INVALID_TYPE_FEATURE;
        case "features.0.geometry.type": return AppErrorEnum.INVALID_TYPE_FEATURE_GEOMETRY;
        case "features": return AppErrorEnum.INVALID_FEATURE_ARRAY;
        case "features.0.properties": return AppErrorEnum.INVALID_PROPERTIES;
        case "features.0.properties.name": return AppErrorEnum.INVALID_NAME_PARAM;
        case "features.0.properties.max_speed": return AppErrorEnum.INVALID_MAX_SPEED;
        case "features.0.geometry": return AppErrorEnum.INVALID_GEOMETRY
        case "features.0.geometry.coordinates": return AppErrorEnum.INVALID_COORDINATES;
        default: return AppErrorEnum.INCORRECT_DATA;
    }
}


export function checkGeoJsonFormat(req: Request, _res: Response, next: NextFunction) {
    validateBody(req.body, geofenceAreaSchema, mapGeofenceAreaErrors, next);
}

function checkCoordinates(req: Request, _res: Response, next: NextFunction) {
    // Le coordinate deve essere un array di Position, cioè coppie di latitudine e longitudine. Lo standard impone questo tipo.
    const coordinates: Position[][] = req.body?.features[0].geometry.coordinates;
    const punti = coordinates[0]; // Prendiamo l'array di punti
    if (!coordinates || !punti) {
        throw ErrorFactory.getError(AppErrorEnum.MISSING_COORDINATES);
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
    if (punti.length < 4) {
        throw ErrorFactory.getError(AppErrorEnum.TOO_LITTLE_POINTS);
    }
    if (punti.length > MAX_POINTS) {
        throw ErrorFactory.getError(AppErrorEnum.TOO_MANY_POINTS);
    }
    // Controllo che il primo e l'ultimo punto coincidono per chiudere l'area. la posizione 0 indica la longitudine, la posizione 1 indica la latitudine.
    const primoPunto = punti[0];
    const ultimoPunto = punti.at(-1);
    if (!primoPunto || !ultimoPunto || primoPunto[0] !== ultimoPunto[0] || primoPunto[1] !== ultimoPunto[1]) {
        throw ErrorFactory.getError(AppErrorEnum.INCORRECT_COORDS);
    }
    // Con turf controlliamo se ci sono punti di sovrapposizione nel poligono
    // Definito dalle coordinare.
    const polygon = turf.polygon(coordinates);
    const kinks = turf.kinks(polygon);
    // kinks contiene il numero di punti di autointersezione, quindi se ce ne sta uno o più, allora il poligono ha dei tratti che s'intersecano
    if (kinks.features.length > 0) {
        throw ErrorFactory.getError(AppErrorEnum.OVERLAPPING_POLYGON);
    }

    next();
}