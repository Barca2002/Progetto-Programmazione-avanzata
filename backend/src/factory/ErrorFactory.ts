import { AppError } from "../models/AppErrorModel.js";
import { ERROR_LIST, AppErrorName } from "../utils/StatusMessages.js";

export class ErrorFactory {
    static getError(errorName: AppErrorName): AppError {
        const error = ERROR_LIST[errorName]; 
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