import type { EncodeFunctionDataParameters, Hex } from "viem";
import { publicResolverSetContenthashSnippet } from "../../contracts/publicResolver.js";
import {
	encodeContentHash,
	type EncodeContentHashErrorType,
} from "../contentHash.js";

// ================================
// Set content hash parameters
// ================================

export type SetContentHashParameters = {
	namehash: Hex;
	contentHash: string | null;
};

export type SetContentHashParametersErrorType = EncodeContentHashErrorType;

export const setContentHashParameters = ({
	namehash,
	contentHash,
}: SetContentHashParameters) => {
	const encodedHash = contentHash ? encodeContentHash(contentHash) : "0x";
	return {
		abi: publicResolverSetContenthashSnippet,
		functionName: "setContenthash",
		args: [namehash, encodedHash],
	} as const satisfies EncodeFunctionDataParameters<
		typeof publicResolverSetContenthashSnippet
	>;
};

export type SetContentHashParametersReturnType = ReturnType<
	typeof setContentHashParameters
>;
