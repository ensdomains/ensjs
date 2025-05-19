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
	setAddrParameters,
	type SetAddrParametersReturnType,
} from "../../utils/coders/setAddr.js";
import { namehash } from "../../utils/name/normalize.js";

export type SetAddressRecordParameters = {
	/** Name to set address record for */
	name: string;
	/** Coin ticker or ID to set */
	coin: string | number;
	/** Value to set, null if deleting */
	value: Address | string | null;
	/** Resolver address to set address record on */
	resolverAddress: Address;
};

export type SetAddressRecordOptions<
	chain extends Chain | undefined,
	account extends Account | undefined,
	chainOverride extends Chain | undefined,
> = Prettify<
	SetAddressRecordParameters &
		WriteTransactionParameters<chain, account, chainOverride>
>;

export type SetAddressRecordReturnType = WriteContractReturnType;

export type SetAddressRecordErrorType = Error;

export const setAddressRecordWriteParameters = <
	chain extends Chain,
	account extends Account,
>(
	client: Client<Transport, chain, account>,
	{ name, coin, value, resolverAddress }: SetAddressRecordParameters,
) => {
	return {
		address: resolverAddress,
		chain: client.chain,
		account: client.account,
		...setAddrParameters({ namehash: namehash(name), coin, value }),
	} as const satisfies WriteContractParameters<
		SetAddrParametersReturnType["abi"]
	>;
};

/**
 * Sets an address record for a name on a resolver.
 * @param client - {@link Client}
 * @param options - {@link SetAddressRecordOptions}
 * @returns Transaction hash. {@link SetAddressRecordReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { setAddressRecord } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setAddressRecord(wallet, {
 *   name: 'ens.eth',
 *   coin: 'ETH',
 *   value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
export async function setAddressRecord<
	chain extends Chain | undefined,
	account extends Account | undefined,
	chainOverride extends Chain | undefined,
>(
	client: Client<Transport, chain, account>,
	{
		name,
		coin,
		value,
		resolverAddress,
		...txArgs
	}: SetAddressRecordOptions<chain, account, chainOverride>,
): Promise<SetAddressRecordReturnType> {
	const data = setAddressRecordWriteParameters(
		clientWithOverrides(client, txArgs),
		{
			name,
			coin,
			value,
			resolverAddress,
		},
	);
	const writeContractAction = getAction(client, writeContract, "writeContract");
	return writeContractAction({
		...data,
		...txArgs,
	} as WriteContractParameters);
}
