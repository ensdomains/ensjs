import type { EncodeFunctionDataParameters, Hex } from "viem";
import { publicResolverClearRecordsSnippet, publicResolverClearRecordsV2Snippet } from "../../contracts/publicResolver.js";

// ================================
// Clear records parameters
// ================================

export type ClearRecordsParametersErrorType = never

export const clearRecordsParameters = (namehash: Hex) =>
  ({
    abi: publicResolverClearRecordsSnippet,
    functionName: 'clearRecords',
    args: [namehash],
  }) as const satisfies EncodeFunctionDataParameters<
    typeof publicResolverClearRecordsSnippet
  >

	export const clearRecordsParametersV2 = () =>
		({
			abi: publicResolverClearRecordsV2Snippet,
			functionName: "clearRecords",
			args: [],
		}) as const satisfies EncodeFunctionDataParameters<
			typeof publicResolverClearRecordsV2Snippet
		>;

export type ClearRecordsParametersReturnType = ReturnType<
  typeof clearRecordsParameters
>
