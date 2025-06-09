import type {
	Account,
	Address,
	Chain,
	Client,
	Transport,
	WriteContractErrorType,
	WriteContractParameters,
	WriteContractReturnType,
} from "viem";
import { writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import type {
	Prettify,
	WriteTransactionParameters,
} from "../../types/index.js";
import {
	type ClientWithOverridesErrorType,
	clientWithOverrides,
} from "../../utils/clientWithOverrides.js";
import {
	type ClearRecordsParametersErrorType,
	clearRecordsParameters,
	clearRecordsParametersV2,
} from "../../utils/coders/clearRecords.js";
import { type NamehashErrorType, namehash } from "../../utils/name/namehash.js";

// ================================
// Write Parameters
// ================================

export type ClearRecordsWriteParametersParameters = {
	/** The name to clear records for */
	name?: string | null;
	/** The resolver address to use */
	resolverAddress: Address;
};

export type ClearRecordsWriteParametersReturnType<
	chain extends Chain = Chain,
	account extends Account = Account,
> = ReturnType<typeof clearRecordsWriteParameters<chain, account>>;

export type ClearRecordsWriteParametersErrorType =
	| ClearRecordsParametersErrorType
	| NamehashErrorType;

export const clearRecordsWriteParameters = <
	chain extends Chain,
	account extends Account,
>(
	client: Client<Transport, chain, account>,
	{ name, resolverAddress }: ClearRecordsWriteParametersParameters,
) => {
	const _clearRecordsParameters = !name
		? clearRecordsParametersV2()
		: clearRecordsParameters(namehash(name));
	return {
		address: resolverAddress,
		chain: client.chain,
		account: client.account,
		..._clearRecordsParameters,
	} as const satisfies WriteContractParameters;
};

// ================================
// Action
// ================================

export type ClearRecordsParameters<
	chain extends Chain | undefined,
	account extends Account | undefined,
	chainOverride extends Chain | undefined,
> = Prettify<
	ClearRecordsWriteParametersParameters &
		WriteTransactionParameters<chain, account, chainOverride>
>;

export type ClearRecordsReturnType = WriteContractReturnType;

export type ClearRecordsErrorType =
	| ClearRecordsParametersErrorType
	| ClientWithOverridesErrorType
	| WriteContractErrorType;

/**
 * Clears the records for a name on a resolver.
 * @param client - {@link Client}
 * @param options - {@link ClearRecordsOptions}
 * @returns Transaction hash. {@link ClearRecordsReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { clearRecords } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await clearRecords(wallet, {
 *   name: 'ens.eth',
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
export async function clearRecords<
	chain extends Chain | undefined,
	account extends Account | undefined,
	chainOverride extends Chain | undefined,
>(
	client: Client<Transport, chain, account>,
	{
		name,
		resolverAddress,
		...txArgs
	}: ClearRecordsParameters<chain, account, chainOverride>,
): Promise<ClearRecordsReturnType> {
	const params = !name
		? {
				resolverAddress,
			}
		: {
				name,
				resolverAddress,
			};

	const writeParameters = clearRecordsWriteParameters(
		clientWithOverrides(client, txArgs),
		params,
	);
	const writeContractAction = getAction(client, writeContract, "writeContract");
	return writeContractAction({
		...writeParameters,
		...txArgs,
	} as WriteContractParameters);
}
