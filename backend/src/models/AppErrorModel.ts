import { AppErrorName } from "../utils/StatusMessages.js";
import { Response } from "express";

export class AppError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly statusName: AppErrorName,
        public readonly message: string
    ) {
        // Bisogna inizializzare l'errore passandogli il messaggio al costruttore della classe base Error.
        super(message);
        this.name = statusName; // best practice: sovrascrivere il nome con uno più contestuale, di default è "Error".
    }

    // Setta lo status code dell'errore e restituisce la risposta in JSON con il nome e messaggio dell'errore, da usare nell'error handler di Express.
    send(res: Response) {
        res.status(this.statusCode).json({"statusCode": this.statusCode, "statusName": this.statusName, "message": this.message});
    }
}