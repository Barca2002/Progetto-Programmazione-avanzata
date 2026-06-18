import { AppSuccess, SuccessDataStructure } from "../models/AppSuccessModel.js";
import { SUCCESS_LIST, AppSuccessName } from "../utils/StatusMessages.js";

export class SuccessFactory {
    // Metodo statico per ottenere un'istanza di AppSuccess basata sul nome del success e i dati da restituire (eventualmente nulli).
    static getSuccess(successName: AppSuccessName, data: SuccessDataStructure | null): AppSuccess {
        // Si estrae lo status e il messaggio da SUCCESS_LIST usando il nome del success.
        const { statusCode, message } = SUCCESS_LIST[successName]; 
        return new AppSuccess(statusCode, successName, message, data);
    }
}