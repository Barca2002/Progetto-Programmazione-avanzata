import { AppErrorName } from "../utils/StatusMessages";

export class AppError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly statusCodeString: AppErrorName,  // stringa leggibile invece di un numero
        message: string
    ) {
        // Bisogna inizializzare l'errore passandogli il messaggio al costruttore della classe base Error.
        super(message);
        this.name = "AppError"; // best practice: sovrascrivere nome con uno più contestuale, di default è "Error".
    }
}