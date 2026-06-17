import { Router, Response, Request, NextFunction } from "express";
import { AppErrorEnum, AppSuccessEnum } from "../utils/StatusMessages.js";
import { ErrorFactory } from "../factory/ErrorFactory.js";
import { SuccessFactory } from "../factory/SuccessFactory.js";

export const testRouter = Router();

testRouter.post('/error', (req: Request, res: Response, next: NextFunction) => {
    // Test di ErrorFactory
    let error = ErrorFactory.getError(AppErrorEnum.EMAIL_NOT_EXIST);
    return res.status(error.statusCode).json({"test": error});
});

testRouter.post('/success', (req: Request, res: Response, next: NextFunction) => {
    // Test di SuccessFactory
    let success = SuccessFactory.getSuccess(AppSuccessEnum.USER_REGISTERED, null);
    return res.status(success.statusCode).json({"test": success});
});