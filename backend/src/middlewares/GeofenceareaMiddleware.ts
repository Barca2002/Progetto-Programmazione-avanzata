import { Position } from "geojson";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { AppErrorEnum, AppErrorName } from "../utils/StatusMessages.js";
import { NextFunction, Request, Response } from "express";
import * as z from "zod";
import * as turf from "@turf/turf";
import { hasMaxDecimals } from "../utils/DecimalChecker.js";
import { isMissingIssueGeoJSON, validateBody, } from "../utils/HelperFunctions.js";
import { MIN_NAME_LENGTH, MAX_NAME_LENGTH, MAX_SPEED_ALLOWED, MAX_POINTS } from "../utils/GlobalConstants.js";

export const checkCreation = [checkGeoJsonFormat, checkCoordinates];

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
    type: z.string().refine(v => v === "FeatureCollection", { message: "INVALID_TYPE_FEATURECOLLECTION" }), // Non usiamo z.literal() perché sennò, in caso di parametro mancante, l'errore generato è invalid_value e non invalid_type, quindi non potevamo gestirlo con lo switch nella validazione.
    features: z.array(
        z.object({
            type: z.string().refine(v => v === "Feature", { message: "INVALID_TYPE_FEATURE" }),
            properties: z.object({
                name: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
                max_speed: z.number().min(1).max(MAX_SPEED_ALLOWED).optional()
            }).strict(),
            geometry: z.object({
                type: z.string().refine(v => v === "Polygon", { message: "INVALID_TYPE_FEATURE_GEOMETRY" }),
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

    console.log(issue);
    if (issue.code === "unrecognized_keys") {
        return AppErrorEnum.INVALID_PARAMS;
    }
   
    const missing = isMissingIssueGeoJSON(issue, reqBody);
    const pathString = issue.path.join(".");

    // Controllo basato sui messaggi custom impostati in PositionSchema, serve per le coordinate.
    if (issue.code === "custom") {
        const customErrorMap: Record<string, AppErrorName> = {
            "2_VALUES_ONLY": AppErrorEnum.INVALID_POSITION_VALUES,
            "MISSING_LONG": AppErrorEnum.INVALID_LONGITUDINE_VALUE,
            "MISSING_LAT": AppErrorEnum.INVALID_LATITUDINE_VALUE,
            "RANGE_NOT_ALLOWED_LONG": AppErrorEnum.INVALID_LONGITUDINE_RANGE,
            "RANGE_NOT_ALLOWED_LAT": AppErrorEnum.INVALID_LATITUDINE_RANGE,
            "TOO_MANY_DECIMALS_LONG": AppErrorEnum.INVALID_LONGITUDINE_DECIMALS,
            "TOO_MANY_DECIMALS_LAT": AppErrorEnum.INVALID_LATITUDINE_DECIMALS,
            "INVALID_TYPE_FEATURECOLLECTION": AppErrorEnum.INVALID_TYPE_FEATURECOLLECTION,
            "INVALID_TYPE_FEATURE": AppErrorEnum.INVALID_TYPE_FEATURE,
            "INVALID_TYPE_FEATURE_GEOMETRY": AppErrorEnum.INVALID_GEOMETRY_TYPE,
        };
        return customErrorMap[issue.message] || AppErrorEnum.INCORRECT_DATA;
    }

    const errorMap: Record<string, { missing: AppErrorName; invalid: AppErrorName }> = {
        "type": {
            missing: AppErrorEnum.MISSING_TYPE_FEATURECOLLECTION,
            invalid: AppErrorEnum.INVALID_TYPE_FEATURECOLLECTION,
        },
        "features": {
            missing: AppErrorEnum.MISSING_FEATURES,
            invalid: AppErrorEnum.INVALID_FEATURE_ARRAY,
        },
        "features.0.type": {
            missing: AppErrorEnum.MISSING_TYPE_FEATURE,
            invalid: AppErrorEnum.INVALID_TYPE_FEATURE,
        },
        "features.0.geometry.type": {
            missing: AppErrorEnum.MISSING_GEOMETRY_TYPE,
            invalid: AppErrorEnum.INVALID_GEOMETRY_TYPE,
        },
        "features.0.properties": {
            missing: AppErrorEnum.MISSING_PROPERTIES,
            invalid: AppErrorEnum.INVALID_PROPERTIES,
        },
        "features.0.properties.name": {
            missing: AppErrorEnum.MISSING_NAME,
            invalid: AppErrorEnum.INVALID_NAME_PARAM,
        },
        "features.0.properties.max_speed": {
            missing: AppErrorEnum.MISSING_DATA,
            invalid: AppErrorEnum.INVALID_MAX_SPEED,
        },
        "features.0.geometry": {
            missing: AppErrorEnum.MISSING_GEOMETRY,
            invalid: AppErrorEnum.INVALID_GEOMETRY,
        },
        "features.0.geometry.coordinates": {
            missing: AppErrorEnum.MISSING_COORDINATES,
            invalid: AppErrorEnum.INVALID_COORDINATES,
        },
    };

    const entry = errorMap[pathString];
    
    // Se il path riscontrato non è registrato nella mappa, restituiamo un errore generico
    if (!entry) {
        return missing ? AppErrorEnum.MISSING_DATA : AppErrorEnum.INCORRECT_DATA;
    }

    return missing ? entry.missing : entry.invalid;
}

export function checkGeoJsonFormat(req: Request, res: Response, next: NextFunction) {
    validateBody(req.body, geofenceAreaSchema, mapGeofenceAreaErrors, next);
}

function checkCoordinates(req: Request, res: Response, next: NextFunction) {
    // Le coordinate deve essere un array di Position, cioè coppie di latitudine e longitudine. Lo standard impone questo tipo.
    const coordinates = req.body?.features?.[0]?.geometry?.coordinates as Position[][];
    const punti = coordinates?.[0]; // Prendiamo l'array di punti
    if (!coordinates || !punti) {
        return next(ErrorFactory.getError(AppErrorEnum.MISSING_COORDINATES));
    }
    // Bisogna controllare 3 cose principali:
    // - Le coordinate devono contenere almeno 4 punti (per creare un triangolo
    //   servono 3 punti + l'ultimo che si sovrappone al primo).
    // - L'ultimo punto ed il primo devono essere uguali per chiudere il poligono
    // - Le linee del poligono non possono intersecarsi.

    // Controllo che coordinates sia un array e che i punti siano un array (cioè coordinates[0])
    if (!Array.isArray(coordinates) || !Array.isArray(coordinates[0])) {
        return next(ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA));
    }

    // Ci devono essere minimo 4 punti e massimo MAX_POINTS punti per definire una geofence area.    
    if (punti.length < 4) {
        return next(ErrorFactory.getError(AppErrorEnum.TOO_LITTLE_POINTS));
    }
    if (punti.length > MAX_POINTS) {
        return next(ErrorFactory.getError(AppErrorEnum.TOO_MANY_POINTS));
    }
    // Controllo che il primo e l'ultimo punto coincidono per chiudere l'area. la posizione 0 indica la longitudine, la posizione 1 indica la latitudine.
    const primoPunto = punti[0];
    const ultimoPunto = punti.at(-1);
    if (!primoPunto || !ultimoPunto || primoPunto[0] !== ultimoPunto[0] || primoPunto[1] !== ultimoPunto[1]) {
        return next(ErrorFactory.getError(AppErrorEnum.INCORRECT_COORDS));
    }
    // Con turf controlliamo se ci sono punti di sovrapposizione nel poligono
    // Definito dalle coordinare.
    const polygon = turf.polygon(coordinates);
    const kinks = turf.kinks(polygon);
    // kinks contiene il numero di punti di autointersezione, quindi se ce ne sta uno o più, allora il poligono ha dei tratti che s'intersecano
    if (kinks.features.length > 0) {
        return next(ErrorFactory.getError(AppErrorEnum.OVERLAPPING_POLYGON));
    }

    next();
}
