import { AppSuccessName } from "../utils/StatusMessages.js";
import { Response } from "express";

// / Definiamo un tipo per rappresentare la struttura dei dati di successo, il quale può contenere chiavi solo di tipo stringa e valori di vari tipi (stringa, numero, booleano, data, array di strutture di successo o array di stringhe). In pratica rappresenta un JSON con valori controllati. Array<SuccessDataStructure> consente di avere una struttura annidata di dati di successo. Consente, per esempio:
// [
//     { id: 1, testo: "Ottimo prodotto" },
//     { id: 2, testo: "Spedizione veloce" }
// ] 
// Invece Array<string> consente campi come: ..., ruoli: ["admin", "user"].
export type SuccessDataStructure = Record<string, string | number | boolean | Date | Array<string> | Array<SuccessDataStructure> | undefined | null>;

export class AppSuccess {
    constructor(
        public readonly statusCode: number,
        public readonly statusName: AppSuccessName,
        public readonly message: string,
        public readonly data: SuccessDataStructure | null
    ) {

    }

    // Setta lo status code della success e restituisce la risposta in JSON con il nome e messaggio.
    send(res: Response) {
        res.status(this.statusCode).json({
            statusCode: this.statusCode,
            statusName: this.statusName,
            message: this.message,
            data: this.data
        });
    }
}