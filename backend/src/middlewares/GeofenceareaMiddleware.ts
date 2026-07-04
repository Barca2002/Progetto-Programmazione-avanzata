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

const geofenceAreaSchema = z.object({
    type: z.string().refine(v => v === "FeatureCollection", { message: "INVALID_TYPE_FEATURECOLLECTION" }),
    features: z.array(
        z.object({
            type: z.string().refine(v => v === "Feature", { message: "INVALID_TYPE_FEATURE" }),
            properties: z.object({
                name: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
                max_speed: z.number().min(1).max(MAX_SPEED_ALLOWED).optional()
            }).strict(),
            geometry: z.object({
                type: z.string().refine(v => v === "Polygon", { message: "INVALID_TYPE_FEATURE_GEOMETRY" }),
                coordinates: z.array(
                    z.array(PositionSchema)
                )
            }).strict(),
        }).strict()
    ),
}).strict();

/**
 * Funzione per mappare gli errori dei campi della richiesta con gli errori definiti nell'enum. Distingue se il campo è mancante o se il formato è errato. Inoltre, sono stati usate degli errori customizzati per controlli aggiuntivi. 
 * @param campo stringa che rappresenta il campo del body della richiesta da validare.
 * @param issue oggetto di Zod che rappresenta il problema del campo. Permette di distinguere se è missing o di tipo errato/invalido.
 * @param reqBody oggetto che rappresenta il body della richiesta. Serve per vedere se il campo è mancante o di tipo errato.
 * @returns restituisce un errore di AppErrorEnum in base al campo, se è mancante o invalido.
 */
export function mapGeofenceAreaErrors(campo: string, issue: z.core.$ZodIssue, reqBody: any): AppErrorName {

    if (issue.code === "unrecognized_keys") {
        return AppErrorEnum.INVALID_PARAMS;
    }

    const missing = isMissingIssueGeoJSON(issue, reqBody);
    const pathString = issue.path.join(".");

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

    if (!entry) {
        return missing ? AppErrorEnum.MISSING_DATA : AppErrorEnum.INCORRECT_DATA;
    }

    return missing ? entry.missing : entry.invalid;
}

/**
 * Funzione che effettua la validazione del formato GeoJSON.
 * @param req oggetto che contiene il body della richiesta.
 * @param res oggetto che contiene la risposta alla richiesta.
 * @param next oggetto NextFunction che può essere utilizzato per chiamare un'altra funzione definita in una pipeline.
 */
export function checkGeoJsonFormat(req: Request, res: Response, next: NextFunction) {
    validateBody(req.body, geofenceAreaSchema, mapGeofenceAreaErrors, next);
}

/**
 * Funzione che effettua la validazione delle coordinate. I vincoli sono:
 * Le coordinate devono contenere almeno 4 punti (per creare un triangolo servono 3 punti più l'ultimo che si sovrappone al primo)
 * L'ultimo punto ed il primo devono essere uguali per chiudere il poligono.
 * Le linee del poligono non possono intersecarsi.
 * La funzione kinks restituisce il numero di punti di autointersezione di un poligono.
 * @param req oggetto che contiene il body della richiesta.
 * @param res oggetto che contiene la risposta alla richiesta.
 * @param next oggetto NextFunction che può essere utilizzato per chiamare un'altra funzione definita in una pipeline.
 */
function checkCoordinates(req: Request, res: Response, next: NextFunction) {

    const coordinates = req.body?.features?.[0]?.geometry?.coordinates as Position[][];
    const punti = coordinates?.[0];
    if (!coordinates || !punti) {
        return next(ErrorFactory.getError(AppErrorEnum.MISSING_COORDINATES));
    }
    if (!Array.isArray(coordinates) || !Array.isArray(punti)) {
        return next(ErrorFactory.getError(AppErrorEnum.INCORRECT_DATA));
    }
    if (punti.length < 4) {
        return next(ErrorFactory.getError(AppErrorEnum.TOO_LITTLE_POINTS));
    }
    if (punti.length > MAX_POINTS) {
        return next(ErrorFactory.getError(AppErrorEnum.TOO_MANY_POINTS));
    }

    const primoPunto = punti[0];
    const ultimoPunto = punti.at(-1);
    if (!primoPunto || !ultimoPunto || primoPunto[0] !== ultimoPunto[0] || primoPunto[1] !== ultimoPunto[1]) {
        return next(ErrorFactory.getError(AppErrorEnum.INCORRECT_COORDS));
    }

    const polygon = turf.polygon(coordinates);
    const autointersezioni = turf.kinks(polygon);

    if (autointersezioni.features.length > 0) {
        return next(ErrorFactory.getError(AppErrorEnum.OVERLAPPING_POLYGON));
    }

    next();
}
