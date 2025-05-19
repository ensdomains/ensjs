import {
	type Account,
	type Address,
	type Client,
	type Transport,
	type WriteContractParameters,
	type WriteContractReturnType,
} from "viem";
import { writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import type { ChainWithContract } from "../../contracts/consts.js";
import { getChainContractAddress } from "../../contracts/getChainContractAddress.js";
import { nameWrapperSetResolverSnippet } from "../../contracts/nameWrapper.js";
import { registrySetResolverSnippet } from "../../contracts/registry.js";
import type {
	Prettify,
	WriteTransactionParameters,
} from "../../types/index.js";
import { clientWithOverrides } from "../../utils/clientWithOverrides.js";
import { namehash } from "../../utils/name/normalize.js";

export type SetResolverParameters = {
	/** Name to set resolver for */
	name: string;
	/** Contract to set resolver on */
	contract: "registry" | "nameWrapper";
	/** Resolver address to set */
	resolverAddress: Address;
};

type ChainWithContractDependencies = ChainWithContract<
	"ensNameWrapper" | "ensRegistry"
>;
export type SetResolverOptions<
	chain extends ChainWithContractDependencies | undefined,
	account extends Account | undefined,
	chainOverride extends ChainWithContractDependencies | undefined,
> = Prettify<
	SetResolverParameters &
		WriteTransactionParameters<chain, account, chainOverride>
>;

export type SetResolverReturnType = WriteContractReturnType;

export type SetResolverErrorType = Error;

export const setResolverWriteParameters = <
	chain extends ChainWithContractDependencies,
	account extends Account,
>(
	client: Client<Transport, chain, account>,
	{ name, contract, resolverAddress }: SetResolverParameters,
) => {
	if (contract !== "registry" && contract !== "nameWrapper")
		throw new Error(`Unknown contract: ${contract}`);

	const address = getChainContractAddress({
		client,
		contract: contract === "nameWrapper" ? "ensNameWrapper" : "ensRegistry",
	});

	const args = [namehash(name), resolverAddress] as const;
	const functionName = "setResolver";

	const baseParams = {
		address,
		functionName,
		args,
		chain: client.chain,
		account: client.account,
	} as const;

	if (contract === "nameWrapper")
		return {
			...baseParams,
			abi: nameWrapperSetResolverSnippet,
		} as const satisfies WriteContractParameters<
			typeof nameWrapperSetResolverSnippet
		>;

	return {
		...baseParams,
		abi: registrySetResolverSnippet,
	} as const satisfies WriteContractParameters<
		typeof registrySetResolverSnippet
	>;
};

/**
 * Sets a resolver for a name.
 * @param client - {@link Client}
 * @param options - {@link SetResolverOptions}
 * @returns Transaction hash. {@link SetResolverReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { setResolver } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setResolver(wallet, {
 *   name: 'ens.eth',
 *   contract: 'registry',
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
export async function setResolver<
	chain extends ChainWithContractDependencies | undefined,
	account extends Account | undefined,
	chainOverride extends ChainWithContractDependencies | undefined,
>(
	client: Client<Transport, chain, account>,
	{
		name,
		contract,
		resolverAddress,
		...txArgs
	}: SetResolverOptions<chain, account, chainOverride>,
): Promise<SetResolverReturnType> {
	const writeParameters = setResolverWriteParameters(
		clientWithOverrides(client, txArgs),
		{
			name,
			contract,
			resolverAddress,
		},
	);
	const writeContractAction = getAction(client, writeContract, "writeContract");
	return writeContractAction({
		...writeParameters,
		...txArgs,
	} as WriteContractParameters);
}
