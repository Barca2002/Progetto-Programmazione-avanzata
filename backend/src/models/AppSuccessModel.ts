import { AppSuccessName } from "../utils/StatusMessages.js";
import { Response } from "express";

export type SuccessDataStructure = Record<string, string | number | boolean | Date | Array<string> | Array<SuccessDataStructure> | undefined | null>;

export class AppSuccess {
    constructor(
        public readonly statusCode: number,
        public readonly statusName: AppSuccessName,
        public readonly message: string,
        public readonly data: SuccessDataStructure | null
    ) {
    }

    send(res: Response) {
        res.status(this.statusCode).json({
            statusCode: this.statusCode,
            statusName: this.statusName,
            message: this.message,
            data: this.data
        });
    }
}