import type {
	Account,
	Chain,
	GetChainContractAddressErrorType,
	WriteContractErrorType,
	WriteContractParameters,
	WriteContractReturnType,
} from "viem";
import { writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import {
	getChainContractAddress,
	type RequireClientContracts,
} from "../../clients/chain.js";
import { bulkRenewalRenewAllSnippet } from "../../contracts/bulkRenewal.js";
import type { ChainWithContract } from "../../contracts/consts.js";
import { l2EthRegistrarRenewSnippet } from "../../contracts/l2EthRegistrar.js";
import { UnsupportedNameTypeError } from "../../errors/general.js";
import type {
	Prettify,
	WriteTransactionParameters,
} from "../../types/index.js";
import { ASSERT_NO_TYPE_ERROR } from "../../types/internal.js";
import {
	type ClientWithOverridesErrorType,
	clientWithOverrides,
} from "../../utils/clientWithOverrides.js";
import { getNameType } from "../../utils/name/getNameType.js";

// ================================
// Write parameters
// ================================

export type RenewNamesWriteParametersParameters = {
	/** Name or names to renew */
	nameOrNames: string | string[];
	/** Duration to renew name(s) for */
	duration: bigint | number;
	/** Value of all renewals */
	value: bigint;
};

export type RenewNamesWriteParametersReturnType = ReturnType<
	typeof renewNamesWriteParameters
>;

export type RenewNamesWriteParametersErrorType =
	| UnsupportedNameTypeError
	| GetChainContractAddressErrorType;

export const renewNamesWriteParameters = <
	chain extends Chain,
	account extends Account,
>(
	client: RequireClientContracts<
		chain,
		"ensEthRegistrarController" | "ensBulkRenewal",
		account
	>,
	{ nameOrNames, duration, value }: RenewNamesWriteParametersParameters,
) => {
	ASSERT_NO_TYPE_ERROR(client);

	const names = Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames];
	const labels = names.map((name) => {
		const label = name.split(".");
		const nameType = getNameType(name);
		if (nameType !== "eth-2ld")
			throw new UnsupportedNameTypeError({
				nameType,
				supportedNameTypes: ["eth-2ld"],
				details: "Only 2ld-eth renewals are currently supported",
			});
		return label[0];
	});

	const baseParams = {
		chain: client.chain,
		account: client.account,
		value,
	} as const;

	if (labels.length === 1) {
		return {
			...baseParams,
			address: getChainContractAddress({
				chain: client.chain,
				contract: "ensEthRegistrarController",
			}),
			abi: l2EthRegistrarRenewSnippet,
			functionName: "renew",
			args: [labels[0], BigInt(duration)],
		} as const satisfies WriteContractParameters;
	}

	return {
		...baseParams,
		address: getChainContractAddress({
			chain: client.chain,
			contract: "ensBulkRenewal",
		}),
		abi: bulkRenewalRenewAllSnippet,
		functionName: "renewAll",
		args: [labels, BigInt(duration)],
	} as const satisfies WriteContractParameters;
};

// ================================
// Renew names action
// ================================

export type RenewNamesParameters<
	chain extends Chain,
	account extends Account,
	chainOverride extends
		| ChainWithContract<"ensEthRegistrarController" | "ensBulkRenewal">
		| undefined,
> = Prettify<
	RenewNamesWriteParametersParameters &
		WriteTransactionParameters<chain, account, chainOverride>
>;

export type RenewNamesReturnType = WriteContractReturnType;

export type RenewNamesErrorType =
	| RenewNamesWriteParametersErrorType
	| ClientWithOverridesErrorType
	| WriteContractErrorType;

/**
 * Renews a name or names for a specified duration.
 * @param client - {@link Client}
 * @param options - {@link RenewNamesOptions}
 * @returns Transaction hash. {@link RenewNamesReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getPrice } from '@ensdomains/ensjs/public'
 * import { renewNames } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 *
 * const duration = 31536000n // 1 year
 * const { base, premium } = await getPrice(wallet, {
 *  nameOrNames: 'example.eth',
 *  duration,
 * })
 * const value = (base + premium) * 110n / 100n // add 10% to the price for buffer
 * const hash = await renewNames(wallet, {
 *   nameOrNames: 'example.eth',
 *   duration,
 *   value,
 * })
 * // 0x...
 */
export async function renewNames<
	chain extends Chain,
	account extends Account,
	chainOverride extends
		| ChainWithContract<"ensEthRegistrarController" | "ensBulkRenewal">
		| undefined,
>(
	client: RequireClientContracts<
		chain,
		"ensEthRegistrarController" | "ensBulkRenewal",
		account
	>,
	{
		nameOrNames,
		duration,
		value,
		...txArgs
	}: RenewNamesParameters<chain, account, chainOverride>,
): Promise<RenewNamesReturnType> {
	ASSERT_NO_TYPE_ERROR(client);

	const writeParameters = renewNamesWriteParameters(
		clientWithOverrides(client, txArgs),
		{ nameOrNames, duration, value },
	);
	const writeContractAction = getAction(client, writeContract, "writeContract");
	return writeContractAction({
		...writeParameters,
		...txArgs,
	} as WriteContractParameters);
}
