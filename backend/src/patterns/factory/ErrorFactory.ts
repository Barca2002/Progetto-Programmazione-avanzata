import { AppError } from "../../models/AppErrorModel.js";
import { ERROR_LIST, AppErrorName } from "../../utils/StatusMessages.js";

export class ErrorFactory {
    // Metodo statico per ottenere un'istanza di AppError (model degli errori) basata sul nome dell'errore.
    static getError(errorName: AppErrorName): AppError {
        const { statusCode, message } = ERROR_LIST[errorName]; // Si estrae lo status e il messaggio dall'ERROR_LIST usando il nome dell'errore.
        return new AppError(statusCode, errorName, message);
    }
}