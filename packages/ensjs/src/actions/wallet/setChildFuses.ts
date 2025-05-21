import type {
	Account,
	Chain,
	Client,
	GetChainContractAddressErrorType,
	LabelhashErrorType,
	Transport,
	WriteContractErrorType,
	WriteContractParameters,
	WriteContractReturnType,
} from "viem";
import { writeContract } from "viem/actions";
import { labelhash } from "viem/ens";
import { getAction } from "viem/utils";
import type { ChainWithContract } from "../../contracts/consts.js";
import { nameWrapperSetChildFusesSnippet } from "../../contracts/nameWrapper.js";
import type {
	Prettify,
	WriteTransactionParameters,
} from "../../types/index.js";
import {
	clientWithOverrides,
	type ClientWithOverridesErrorType,
} from "../../utils/clientWithOverrides.js";
import {
	type EncodeFusesErrorType,
	type EncodeFusesInputObject,
	encodeFuses,
} from "../../utils/fuses.js";
import { namehash, type NamehashErrorType } from "../../utils/name/namehash.js";
import {
	getChainContractAddress,
	type RequireClientContracts,
} from "../../clients/chain.js";
import { ASSERT_NO_TYPE_ERROR } from "../../types/internal.js";

// ================================
// Write parameters
// ================================

export type SetChildFusesWriteParametersParameters = {
	/** Name to set child fuses for */
	name: string;
	/** Fuse object or number value to set to */
	fuses: EncodeFusesInputObject;
	/** Expiry to set for fuses */
	expiry?: number | bigint;
};

export type SetChildFusesWriteParametersReturnType = ReturnType<
	typeof setChildFusesWriteParameters
>;

export type SetChildFusesWriteParametersErrorType =
	| EncodeFusesErrorType
	| LabelhashErrorType
	| NamehashErrorType
	| GetChainContractAddressErrorType;

export const setChildFusesWriteParameters = <
	chain extends Chain,
	account extends Account,
>(
	client: RequireClientContracts<chain, "ensNameWrapper", account>,
	{ name, fuses, expiry }: SetChildFusesWriteParametersParameters,
) => {
	ASSERT_NO_TYPE_ERROR(client);

	const encodedFuses = encodeFuses({ input: fuses });
	const labels = name.split(".");
	const labelHash = labelhash(labels.shift()!);
	const parentNode = namehash(labels.join("."));

	return {
		address: getChainContractAddress({
			chain: client.chain,
			contract: "ensNameWrapper",
		}),
		abi: nameWrapperSetChildFusesSnippet,
		functionName: "setChildFuses",
		args: [parentNode, labelHash, encodedFuses, BigInt(expiry ?? 0)],
		chain: client.chain,
		account: client.account,
	} as const satisfies WriteContractParameters<
		typeof nameWrapperSetChildFusesSnippet
	>;
};

// ================================
// Action
// ================================

export type SetChildFusesParameters<
	chain extends Chain | undefined,
	account extends Account | undefined,
	chainOverride extends Chain | undefined,
> = Prettify<
	SetChildFusesWriteParametersParameters &
		WriteTransactionParameters<chain, account, chainOverride>
>;

export type SetChildFusesReturnType = WriteContractReturnType;

export type SetChildFusesErrorType =
	| SetChildFusesWriteParametersErrorType
	| ClientWithOverridesErrorType
	| WriteContractErrorType;
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
	chain extends Chain,
	account extends Account,
	chainOverride extends Chain | undefined,
>(
	client: RequireClientContracts<chain, "ensNameWrapper", account>,
	{
		name,
		fuses,
		expiry,
		...txArgs
	}: SetChildFusesParameters<chain, account, chainOverride>,
): Promise<SetChildFusesReturnType> {
	ASSERT_NO_TYPE_ERROR(client);

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
