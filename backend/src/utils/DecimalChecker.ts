import { MAX_DECIMALS } from "./GlobalConstants.js";

export const hasMaxDecimals = (value: number) => {
    const parts = value.toString().split(".");
    return parts.length === 1 || parts[1]!.length <= MAX_DECIMALS;
};