import { AppError } from "../models/AppErrorModel.js";
import { ERROR_LIST, AppErrorName } from "../utils/StatusMessages.js";

export class ErrorFactory {
    // Metodo statico per ottenere un'istanza di AppError (model degli errori) basata sul nome dell'errore.
    static getError(errorName: AppErrorName): AppError {
        // Si estrae lo status e il messaggio dall'ERROR_LIST usando il nome dell'errore.
        const error = ERROR_LIST[errorName]; 
        // Errore di fallback
        if (!error) {
            const fallback = ERROR_LIST.INTERNAL_ERROR;

            return new AppError(
                fallback.statusCode,
                "INTERNAL_ERROR",
                fallback.message
            );
        }
        return new AppError(error.statusCode, errorName, error.message);
    }
}