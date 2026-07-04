import { AppErrorName } from "../utils/StatusMessages.js";
import { Response } from "express";

export class AppError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly statusName: AppErrorName,
        public readonly message: string
    ) {
        super(message);
        this.name = statusName;
    }

    send(res: Response) {
        res.status(this.statusCode).json({ "statusCode": this.statusCode, "statusName": this.statusName, "message": this.message });
    }
}