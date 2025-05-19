import {
	type Account,
	type Client,
	type Hash,
	type Transport,
	type WriteContractParameters,
} from "viem";
import { writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import type { ChainWithContract } from "../../contracts/consts.js";
import { getChainContractAddress } from "../../contracts/getChainContractAddress.js";
import { nameWrapperSetFusesSnippet } from "../../contracts/nameWrapper.js";
import type {
	Prettify,
	WriteTransactionParameters,
} from "../../types/index.js";
import { clientWithOverrides } from "../../utils/clientWithOverrides.js";
import {
	encodeFuses,
	type EncodeChildFusesInputObject,
} from "../../utils/fuses.js";
import { namehash } from "../../utils/name/normalize.js";

export type SetFusesParameters = {
	/** Name to set fuses for */
	name: string;
	/** Fuse object to set to */
	fuses: EncodeChildFusesInputObject;
};

type ChainWithContractDependencies = ChainWithContract<"ensNameWrapper">;
export type SetFusesOptions<
	chain extends ChainWithContractDependencies | undefined,
	account extends Account | undefined,
	chainOverride extends ChainWithContractDependencies | undefined,
> = Prettify<
	SetFusesParameters & WriteTransactionParameters<chain, account, chainOverride>
>;

export type SetFusesReturnType = Hash;

export type SetFusesErrorType = Error;

export const setFusesWriteParameters = <
	chain extends ChainWithContractDependencies,
	account extends Account,
>(
	client: Client<Transport, chain, account>,
	{ name, fuses }: SetFusesParameters,
) => {
	const encodedFuses = encodeFuses({ restriction: "child", input: fuses });
	return {
		address: getChainContractAddress({ client, contract: "ensNameWrapper" }),
		abi: nameWrapperSetFusesSnippet,
		functionName: "setFuses",
		args: [namehash(name), encodedFuses],
		chain: client.chain,
		account: client.account,
	} as const satisfies WriteContractParameters<
		typeof nameWrapperSetFusesSnippet
	>;
};

/**
 * Sets the fuses for a name.
 * @param client - {@link Client}
 * @param options - {@link SetFusesOptions}
 * @returns Transaction hash. {@link SetFusesReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { setFuses } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setFuses(wallet, {
 *   name: 'sub.ens.eth',
 *   fuses: {
 *     named: ['CANNOT_TRANSFER'],
 *   },
 * })
 * // 0x...
 */
export async function setFuses<
	chain extends ChainWithContractDependencies | undefined,
	account extends Account | undefined,
	chainOverride extends ChainWithContractDependencies | undefined,
>(
	client: Client<Transport, chain, account>,
	{ name, fuses, ...txArgs }: SetFusesOptions<chain, account, chainOverride>,
): Promise<SetFusesReturnType> {
	const data = setFusesWriteParameters(clientWithOverrides(client, txArgs), {
		name,
		fuses,
	});
	const writeContractAction = getAction(client, writeContract, "writeContract");
	return writeContractAction({
		...data,
		...txArgs,
	} as WriteContractParameters);
}
