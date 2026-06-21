import { AppSuccess, SuccessDataStructure } from "../models/AppSuccessModel.js";
import { SUCCESS_LIST, AppSuccessName } from "../utils/StatusMessages.js";

export class SuccessFactory {
    // Metodo statico per ottenere un'istanza di AppSuccess basata sul nome del success e i dati da restituire (eventualmente nulli).
    static getSuccess<T>(successName: AppSuccessName, data: T): AppSuccess {
        // Si estrae lo status e il messaggio da SUCCESS_LIST usando il nome del success.
        const { statusCode, message } = SUCCESS_LIST[successName]; 
        return new AppSuccess(statusCode, successName, message, data as unknown as SuccessDataStructure | null); //visto che data puo essere qualunque (T), passo per unkwown perché TypeScript non permette di castare direttamente da un tipo generico T a SuccessDataStructure | null se non c'è una relazione tra i due
    }
}