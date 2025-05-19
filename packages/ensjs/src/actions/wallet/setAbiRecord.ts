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
import type {
	AbiEncodeAs,
	EncodeAbiParameters,
} from "../../utils/coders/encodeAbi.js";
import {
	setAbiParameters,
	type SetAbiParameters,
	type SetAbiParametersReturnType,
} from "../../utils/coders/setAbi.js";
import { namehash } from "../../utils/name/normalize.js";

export type SetAbiRecordParameters<encodeAs extends AbiEncodeAs = AbiEncodeAs> =
	Prettify<
		EncodeAbiParameters<encodeAs> & {
			/** Name to set ABI for */
			name: string;
			/** Resolver address to set ABI on */
			resolverAddress: Address;
		}
	>;

export type SetAbiRecordOptions<
	encodeAs extends AbiEncodeAs,
	chain extends Chain | undefined,
	account extends Account | undefined,
	chainOverride extends Chain | undefined,
> = Prettify<
	SetAbiRecordParameters<encodeAs> &
		WriteTransactionParameters<chain, account, chainOverride>
>;

export type SetAbiRecordReturnType = WriteContractReturnType;

export type SetAbiRecordErrorType = Error;

export const setAbiRecordWriteParameters = async <
	encodeAs extends AbiEncodeAs,
	chain extends Chain,
	account extends Account,
>(
	client: Client<Transport, chain, account>,
	{ name, data, encodeAs, resolverAddress }: SetAbiRecordParameters<encodeAs>,
) => {
	return {
		address: resolverAddress,
		chain: client.chain,
		account: client.account,
		...(await setAbiParameters({
			namehash: namehash(name),
			data,
			encodeAs,
		} as SetAbiParameters<encodeAs>)),
	} as const satisfies WriteContractParameters<
		SetAbiParametersReturnType["abi"]
	>;
};

/**
 * Sets the ABI for a name on a resolver.
 * @param client - {@link Client}
 * @param options - {@link SetAbiRecordOptions}
 * @returns Transaction hash. {@link SetAbiRecordReturnType}
 *
 * @example
 * import abi from './abi.json'
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { encodeAbi } from '@ensdomains/ensjs/utils'
 * import { setAbiRecord } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 *
 * const encodedAbi = await encodeAbi({ encodeAs: 'json', abi })
 * const hash = await setAbiRecord(wallet, {
 *   name: 'ens.eth',
 *   encodedAbi,
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
export async function setAbiRecord<
	encodeAs extends AbiEncodeAs,
	chain extends Chain | undefined,
	account extends Account | undefined,
	chainOverride extends Chain | undefined,
>(
	client: Client<Transport, chain, account>,
	{
		name,
		data,
		encodeAs,
		resolverAddress,
		...txArgs
	}: SetAbiRecordOptions<encodeAs, chain, account, chainOverride>,
): Promise<SetAbiRecordReturnType> {
	const writeParameters = await setAbiRecordWriteParameters(
		clientWithOverrides(client, txArgs),
		{
			name,
			data,
			encodeAs,
			resolverAddress,
		} as SetAbiRecordParameters<encodeAs>,
	);
	const writeContractAction = getAction(client, writeContract, "writeContract");
	return writeContractAction({
		...writeParameters,
		...txArgs,
	} as WriteContractParameters);
}
