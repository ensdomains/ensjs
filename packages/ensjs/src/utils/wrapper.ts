import { stringToBytes, type StringToBytesErrorType } from "viem";
import { WrappedLabelTooLargeError, type ErrorType } from "../errors/utils.js";
import type { AnyDate } from "../types/index.js";
import { ParentFuses } from "./fuses.js";

export const MAX_EXPIRY = 2n ** 64n - 1n;

// ================================
// Expiry to bigint
// ================================

export type ExpiryToBigIntErrorType = TypeError | ErrorType;

export const expiryToBigInt = (expiry?: AnyDate, defaultValue = 0n): bigint => {
	if (!expiry) return defaultValue;
	if (typeof expiry === "bigint") return expiry;
	if (typeof expiry === "string" || typeof expiry === "number")
		return BigInt(expiry);
	if (expiry instanceof Date)
		return BigInt(Math.floor(expiry.getTime() / 1000));
	throw new TypeError("Expiry must be a bigint, string, number or Date");
};

// ================================
// Wrapped label length check
// ================================

export type WrappedLabelLengthCheckErrorType =
	| WrappedLabelTooLargeError
	| StringToBytesErrorType;

export const wrappedLabelLengthCheck = (label: string) => {
	const bytes = stringToBytes(label);
	if (bytes.byteLength > 255)
		throw new WrappedLabelTooLargeError({
			label,
			byteLength: bytes.byteLength,
		});
};

// ================================
// Make default expiry
// ================================

export type MakeDefaultExpiryErrorType = ErrorType;

export const makeDefaultExpiry = (fuses?: number): bigint => {
	if (fuses && BigInt(fuses) & ParentFuses.PARENT_CANNOT_CONTROL)
		return MAX_EXPIRY;
	return 0n;
};
