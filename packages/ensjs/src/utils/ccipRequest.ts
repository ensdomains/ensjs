import {
	type CcipRequestParameters,
	type Chain,
	type DecodeFunctionDataErrorType,
	decodeFunctionData,
	type EncodeFunctionResultErrorType,
	encodeFunctionResult,
	type IsAddressEqualErrorType,
	isAddressEqual,
	parseAbi,
	type CcipRequestErrorType as viem_CcipRequestErrorType,
	ccipRequest as viemCcipRequest,
} from "viem";
import {
	type GetChainContractAddressErrorType,
	getChainContractAddress,
} from "../contracts/getChainContractAddress.js";
import {
	type CcipBatchRequestErrorType,
	ccipBatchRequest,
} from "./ccipBatchRequest.js";

const abi = parseAbi([
	"function query((address,string[],bytes)[]) returns (bool[],bytes[])",
]);

const universalResolverQuerySig = "0xa780bab6";

// ================================
// Ccip request
// ================================

export type CcipRequestErrorType =
	| GetChainContractAddressErrorType
	| IsAddressEqualErrorType
	| DecodeFunctionDataErrorType
	| CcipBatchRequestErrorType
	| EncodeFunctionResultErrorType
	| viem_CcipRequestErrorType;

export const ccipRequest =
	<TChain extends Chain>(chain: TChain) =>
	async ({
		data,
		sender,
		urls,
	}: CcipRequestParameters): ReturnType<typeof viemCcipRequest> => {
		// TODO: Improve
		const universalResolverAddress = getChainContractAddress({
			client: { chain },
			contract: "ensUniversalResolver",
		});
		const isUniversalResolverRequest = isAddressEqual(
			sender,
			universalResolverAddress,
		);
		if (
			isUniversalResolverRequest &&
			data.slice(0, 10) === universalResolverQuerySig
		) {
			const { args } = decodeFunctionData({ abi, data });
			const result = await ccipBatchRequest(args[0]);
			return encodeFunctionResult({ abi, result });
		}

		return viemCcipRequest({ data, sender, urls });
	};
