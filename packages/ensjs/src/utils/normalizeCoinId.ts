import {
	type Coin,
	getCoderByCoinName,
	getCoderByCoinType,
} from "@ensdomains/address-encoder";
import { CoinFormatterNotFoundError } from "../errors/public.js";
import type { ErrorType } from "../errors/utils.js";

// ================================
// Normalize coin id
// ================================

export type NormalizeCoinIdReturnType =
	| {
			type: "id";
			value: number;
	  }
	| {
			type: "name";
			value: string;
	  };

export const normalizeCoinId = (
	coinId: string | number,
): NormalizeCoinIdReturnType => {
	const isString = typeof coinId === "string";

	if (isString && Number.isNaN(parseInt(coinId))) {
		return {
			type: "name",
			value: coinId.toLowerCase().replace(/legacy$/, "Legacy"),
		} as const;
	}
	return {
		type: "id",
		value: isString ? parseInt(coinId as string) : (coinId as number),
	} as const;
};

// ================================
// Get coder from coin
// ================================

export type GetCoderFromCoinReturnType = Coin;

export type GetCoderFromCoinErrorType = CoinFormatterNotFoundError | ErrorType;

export const getCoderFromCoin = (
	coinId: string | number,
): GetCoderFromCoinReturnType => {
	const normalizedCoin = normalizeCoinId(coinId);
	let coder: Coin;
	try {
		coder =
			normalizedCoin.type === "id"
				? // may throw Error
					getCoderByCoinType(normalizedCoin.value)
				: // may throw Error
					getCoderByCoinName(normalizedCoin.value);
	} catch {
		throw new CoinFormatterNotFoundError({ coinType: coinId });
	}

	return coder;
};
