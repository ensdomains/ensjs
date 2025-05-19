import type {
	Account,
	Client,
	Transport,
	WriteContractParameters,
	WriteContractReturnType,
} from "viem";
import { writeContract } from "viem/actions";
import { labelhash } from "viem/ens";
import { getAction } from "viem/utils";
import type { ChainWithContract } from "../../contracts/consts.js";
import { getChainContractAddress } from "../../contracts/getChainContractAddress.js";
import { nameWrapperSetChildFusesSnippet } from "../../contracts/nameWrapper.js";
import type {
	Prettify,
	WriteTransactionParameters,
} from "../../types/index.js";
import { clientWithOverrides } from "../../utils/clientWithOverrides.js";
import { encodeFuses, type EncodeFusesInputObject } from "../../utils/fuses.js";
import { namehash } from "../../utils/name/normalize.js";

export type SetChildFusesParameters = {
	/** Name to set child fuses for */
	name: string;
	/** Fuse object or number value to set to */
	fuses: EncodeFusesInputObject;
	/** Expiry to set for fuses */
	expiry?: number | bigint;
};

type ChainWithContractDependencies = ChainWithContract<"ensNameWrapper">;
export type SetChildFusesOptions<
	chain extends ChainWithContractDependencies | undefined,
	account extends Account | undefined,
	chainOverride extends ChainWithContractDependencies | undefined,
> = Prettify<
	SetChildFusesParameters &
		WriteTransactionParameters<chain, account, chainOverride>
>;

export type SetChildFusesReturnType = WriteContractReturnType;

export type SetChildFusesErrorType = Error;

export const setChildFusesWriteParameters = <
	chain extends ChainWithContractDependencies,
	account extends Account,
>(
	client: Client<Transport, chain, account>,
	{ name, fuses, expiry }: SetChildFusesParameters,
) => {
	const encodedFuses = encodeFuses({ input: fuses });
	const labels = name.split(".");
	const labelHash = labelhash(labels.shift()!);
	const parentNode = namehash(labels.join("."));

	return {
		address: getChainContractAddress({ client, contract: "ensNameWrapper" }),
		abi: nameWrapperSetChildFusesSnippet,
		functionName: "setChildFuses",
		args: [parentNode, labelHash, encodedFuses, BigInt(expiry ?? 0)],
		chain: client.chain,
		account: client.account,
	} as const satisfies WriteContractParameters<
		typeof nameWrapperSetChildFusesSnippet
	>;
};

/**
 * Sets the fuses for a name as the parent.
 * @param client - {@link Client}
 * @param options - {@link SetChildFusesOptions}
 * @returns Transaction hash. {@link SetChildFusesReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { setChildFuses } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setChildFuses(wallet, {
 *   name: 'sub.ens.eth',
 *   fuses: {
 *     parent: {
 *       named: ['PARENT_CANNOT_CONTROL'],
 *     },
 *   },
 * })
 * // 0x...
 */
export async function setChildFuses<
	chain extends ChainWithContractDependencies | undefined,
	account extends Account | undefined,
	chainOverride extends ChainWithContractDependencies | undefined,
>(
	client: Client<Transport, chain, account>,
	{
		name,
		fuses,
		expiry,
		...txArgs
	}: SetChildFusesOptions<chain, account, chainOverride>,
): Promise<SetChildFusesReturnType> {
	const data = setChildFusesWriteParameters(
		clientWithOverrides(client, txArgs),
		{ name, fuses, expiry },
	);
	const writeContractAction = getAction(client, writeContract, "writeContract");
	return writeContractAction({
		...data,
		...txArgs,
	} as WriteContractParameters);
}
