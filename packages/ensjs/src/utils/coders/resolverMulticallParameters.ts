import { type Hex } from "viem";
import type { Prettify } from "../../types/index.js";
import {
	clearRecordsParameters,
	type ClearRecordsParametersErrorType,
	type ClearRecordsParametersReturnType,
} from "./clearRecords.js";
import type { EncodeAbiParameters } from "./encodeAbi.js";
import {
	setAbiParameters,
	type SetAbiParametersErrorType,
	type SetAbiParametersReturnType,
} from "./setAbi.js";
import {
	setAddrParameters,
	type SetAddrParameters,
	type SetAddrParametersErrorType,
	type SetAddrParametersReturnType,
} from "./setAddr.js";
import {
	setContentHashParameters,
	type SetContentHashParametersErrorType,
	type SetContentHashParametersReturnType,
} from "./setContentHash.js";
import {
	setTextParameters,
	type SetTextParameters,
	type SetTextParametersErrorType,
	type SetTextParametersReturnType,
} from "./setText.js";

export type RecordOptions = Prettify<{
	/** Clears all current records */
	clearRecords?: boolean;
	/** ContentHash value */
	contentHash?: string | null;
	/** Array of text records */
	texts?: Omit<SetTextParameters, "namehash">[];
	/** Array of coin records */
	coins?: Omit<SetAddrParameters, "namehash">[];
	/** ABI value */
	abi?: EncodeAbiParameters | EncodeAbiParameters[];
}>;

type ResolverMulticallItem =
	| ClearRecordsParametersReturnType
	| SetContentHashParametersReturnType
	| SetAbiParametersReturnType
	| SetTextParametersReturnType
	| SetAddrParametersReturnType;

// ================================
// Resolver multicall item
// ================================

export type ResolverMulticallParametersReturnType = ResolverMulticallItem[];

export type ResolverMulticallItemErrorType =
	| ClearRecordsParametersErrorType
	| SetContentHashParametersErrorType
	| SetAbiParametersErrorType
	| SetTextParametersErrorType
	| SetAddrParametersErrorType;

export const resolverMulticallParameters = async ({
	namehash,
	clearRecords,
	contentHash,
	texts,
	coins,
	abi,
}: {
	namehash: Hex;
} & RecordOptions): Promise<ResolverMulticallParametersReturnType> => {
	const calls: ResolverMulticallParametersReturnType = [];

	if (clearRecords) {
		calls.push(clearRecordsParameters(namehash));
	}

	if (contentHash !== undefined) {
		const data = setContentHashParameters({ namehash, contentHash });
		if (data) calls.push(data);
	}

	if (abi !== undefined) {
		const abis = Array.isArray(abi) ? abi : [abi];
		const data = await Promise.all(
			abis.map(async (abiItem) => setAbiParameters({ namehash, ...abiItem })),
		);
		if (data) calls.push(...data);
	}

	if (texts && texts.length > 0) {
		const data = texts.map((textItem) =>
			setTextParameters({ namehash, ...textItem }),
		);
		if (data) calls.push(...data);
	}

	if (coins && coins.length > 0) {
		const data = coins.map((coinItem) =>
			setAddrParameters({ namehash, ...coinItem }),
		);
		if (data) calls.push(...data);
	}

	return calls;
};
