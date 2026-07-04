import { AppSuccess, SuccessDataStructure } from "../models/AppSuccessModel.js";
import { SUCCESS_LIST, AppSuccessName } from "../utils/StatusMessages.js";

export class SuccessFactory {
    static getSuccess<T>(successName: AppSuccessName, data: T): AppSuccess {
        const { statusCode, message } = SUCCESS_LIST[successName]; 
        return new AppSuccess(statusCode, successName, message, data as unknown as SuccessDataStructure | null);
    }
}