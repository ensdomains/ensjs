import {
	type Account,
	type Address,
	type Client,
	type Hash,
	type Transport,
	type WriteContractParameters,
} from "viem";
import { writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import type { ChainWithContract } from "../../contracts/consts.js";
import { getChainContractAddress } from "../../contracts/getChainContractAddress.js";
import {
	reverseRegistrarSetNameForAddrSnippet,
	reverseRegistrarSetNameSnippet,
} from "../../contracts/reverseRegistrar.js";
import type {
	Prettify,
	WriteTransactionParameters,
} from "../../types/index.js";
import { clientWithOverrides } from "../../utils/clientWithOverrides.js";

type BaseSetPrimaryNameDataParameters = {
	/** The name to set as primary */
	name: string;
	/** The address to set the primary name for */
	address?: Address;
	/** The resolver address to use */
	resolverAddress?: Address;
};

type SelfSetPrimaryNameDataParameters = {
	address?: never;
	resolverAddress?: never;
};

type OtherSetPrimaryNameDataParameters = {
	address: Address;
	resolverAddress?: Address;
};

export type SetPrimaryNameDataParameters = BaseSetPrimaryNameDataParameters &
	(SelfSetPrimaryNameDataParameters | OtherSetPrimaryNameDataParameters);

type ChainWithContractDependencies = ChainWithContract<
	"ensPublicResolver" | "ensReverseRegistrar"
>;
export type SetPrimaryNameParameters<
	chain extends ChainWithContractDependencies | undefined,
	account extends Account | undefined,
	chainOverride extends ChainWithContractDependencies | undefined,
> = Prettify<
	SetPrimaryNameDataParameters &
		WriteTransactionParameters<chain, account, chainOverride>
>;

export type SetPrimaryNameReturnType = Hash;

export type SetPrimaryNameErrorType = Error;

export const setPrimaryNameWriteParameters = <
	chain extends ChainWithContractDependencies,
	account extends Account,
>(
	client: Client<Transport, chain, account>,
	{
		name,
		address,
		resolverAddress = getChainContractAddress({
			client,
			contract: "ensPublicResolver",
		}),
	}: SetPrimaryNameDataParameters,
) => {
	const reverseRegistrarAddress = getChainContractAddress({
		client,
		contract: "ensReverseRegistrar",
	});

	const baseParams = {
		address: reverseRegistrarAddress,
		account: client.account,
		chain: client.chain,
	} as const;

	if (address)
		return {
			...baseParams,
			abi: reverseRegistrarSetNameForAddrSnippet,
			functionName: "setNameForAddr",
			args: [address, client.account.address, resolverAddress, name],
		} as const satisfies WriteContractParameters<
			typeof reverseRegistrarSetNameForAddrSnippet
		>;

	return {
		...baseParams,
		abi: reverseRegistrarSetNameSnippet,
		functionName: "setName",
		args: [name],
	} as const satisfies WriteContractParameters<
		typeof reverseRegistrarSetNameSnippet
	>;
};

/**
 * Sets a primary name for an address.
 * @param client - {@link Client}
 * @param options - {@link SetPrimaryNameOptions}
 * @returns Transaction hash. {@link SetPrimaryNameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { setPrimaryName } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setPrimaryName(wallet, {
 *   name: 'ens.eth',
 * })
 * // 0x...
 */
export async function setPrimaryName<
	chain extends ChainWithContractDependencies,
	account extends Account | undefined,
	chainOverride extends ChainWithContractDependencies | undefined,
>(
	client: Client<Transport, chain, account>,
	{
		name,
		address,
		resolverAddress,
		...txArgs
	}: SetPrimaryNameParameters<chain, account, chainOverride>,
): Promise<SetPrimaryNameReturnType> {
	const writeParameters = setPrimaryNameWriteParameters(
		clientWithOverrides(client, txArgs),
		{ name, address, resolverAddress } as SetPrimaryNameDataParameters,
	);
	const writeContractAction = getAction(client, writeContract, "writeContract");
	return writeContractAction({
		...writeParameters,
		...txArgs,
	} as WriteContractParameters);
}
