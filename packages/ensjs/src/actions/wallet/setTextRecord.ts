import type {
	Account,
	Address,
	Chain,
	Client,
	Transport,
	WriteContractParameters,
	WriteContractReturnType,
} from "viem";
import { writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import type {
	Prettify,
	WriteTransactionParameters,
} from "../../types/index.js";
import { clientWithOverrides } from "../../utils/clientWithOverrides.js";
import {
	setTextParameters,
	type SetTextParametersReturnType,
} from "../../utils/coders/setText.js";
import { namehash } from "../../utils/name/normalize.js";

export type SetTextRecordParameters = {
	/** The name to set a text record for */
	name: string;
	/** The text record key to set */
	key: string;
	/** The text record value to set */
	value: string | null;
	/** The resolver address to use */
	resolverAddress: Address;
};

export type SetTextRecordOptions<
	chain extends Chain | undefined,
	account extends Account | undefined,
	chainOverride extends Chain | undefined,
> = Prettify<
	SetTextRecordParameters &
		WriteTransactionParameters<chain, account, chainOverride>
>;

export type SetTextRecordReturnType = WriteContractReturnType;

export type SetTextRecordErrorType = Error;

export const setTextRecordWriteParameters = <
	chain extends Chain,
	account extends Account,
>(
	client: Client<Transport, chain, account>,
	{ name, key, value, resolverAddress }: SetTextRecordParameters,
) => {
	return {
		address: resolverAddress,
		chain: client.chain,
		account: client.account,
		...setTextParameters({ namehash: namehash(name), key, value }),
	} as const satisfies WriteContractParameters<
		SetTextParametersReturnType["abi"]
	>;
};

/**
 * Sets a text record for a name on a resolver.
 * @param client - {@link Client}
 * @param options - {@link SetTextRecordOptions}
 * @returns Transaction hash. {@link SetTextRecordReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { setTextRecord } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setTextRecord(wallet, {
 *   name: 'ens.eth',
 *   key: 'foo',
 *   value: 'bar',
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
export async function setTextRecord<
	chain extends Chain | undefined,
	account extends Account | undefined,
	chainOverride extends Chain | undefined,
>(
	client: Client<Transport, chain, account>,
	{
		name,
		key,
		value,
		resolverAddress,
		...txArgs
	}: SetTextRecordOptions<chain, account, chainOverride>,
): Promise<SetTextRecordReturnType> {
	const writeParameters = setTextRecordWriteParameters(
		clientWithOverrides(client, txArgs),
		{
			name,
			key,
			value,
			resolverAddress,
		},
	);
	const writeContractAction = getAction(client, writeContract, "writeContract");
	return writeContractAction({
		...writeParameters,
		...txArgs,
	} as WriteContractParameters);
}
