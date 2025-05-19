import {
	type Account,
	type Address,
	type Chain,
	type Client,
	type Transport,
	type WriteContractParameters,
	type WriteContractReturnType,
} from "viem";
import { writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import type {
	Prettify,
	WriteTransactionParameters,
} from "../../types/index.js";
import { clientWithOverrides } from "../../utils/clientWithOverrides.js";
import {
	clearRecordsParameters,
	type ClearRecordsParametersReturnType,
} from "../../utils/coders/clearRecords.js";
import { namehash } from "../../utils/name/normalize.js";

export type ClearRecordsParameters = {
	/** The name to clear records for */
	name: string;
	/** The resolver address to use */
	resolverAddress: Address;
};

export type ClearRecordsOptions<
	chain extends Chain | undefined,
	account extends Account | undefined,
	chainOverride extends Chain | undefined,
> = Prettify<
	ClearRecordsParameters &
		WriteTransactionParameters<chain, account, chainOverride>
>;

export type ClearRecordsReturnType = WriteContractReturnType;

export type ClearRecordsErrorType = Error;

export const clearRecordsWriteParameters = <
	chain extends Chain,
	account extends Account,
>(
	client: Client<Transport, chain, account>,
	{ name, resolverAddress }: ClearRecordsParameters,
) => {
	return {
		address: resolverAddress,
		chain: client.chain,
		account: client.account,
		...clearRecordsParameters(namehash(name)),
	} as const satisfies WriteContractParameters<
		ClearRecordsParametersReturnType["abi"]
	>;
};

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
	}: ClearRecordsOptions<chain, account, chainOverride>,
): Promise<ClearRecordsReturnType> {
	const writeParameters = clearRecordsWriteParameters(
		clientWithOverrides(client, txArgs),
		{ name, resolverAddress },
	);
	const writeContractAction = getAction(client, writeContract, "writeContract");
	return writeContractAction({
		...writeParameters,
		...txArgs,
	} as WriteContractParameters);
}
