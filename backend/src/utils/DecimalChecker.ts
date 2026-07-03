import { MAX_DECIMALS } from "./GlobalConstants.js";

// Funzione per controllare se i numeri dopo la virgola non superano MAX_DECIMALS
export const hasMaxDecimals = (value: number) => {
    const parts = value.toString().split(".");
    return parts.length === 1 || parts[1]!.length <= MAX_DECIMALS;
};