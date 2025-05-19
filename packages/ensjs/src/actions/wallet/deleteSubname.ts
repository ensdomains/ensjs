import {
	zeroAddress,
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
import {
	nameWrapperSetRecordSnippet,
	nameWrapperSetSubnodeRecordSnippet,
} from "../../contracts/nameWrapper.js";
import {
	registrySetRecordSnippet,
	registrySetSubnodeRecordSnippet,
} from "../../contracts/registry.js";
import {
	InvalidContractTypeError,
	UnsupportedNameTypeError,
} from "../../errors/general.js";
import type {
	Prettify,
	WriteTransactionParameters,
} from "../../types/index.js";
import { clientWithOverrides } from "../../utils/clientWithOverrides.js";
import { getNameType } from "../../utils/name/getNameType.js";
import { makeLabelNodeAndParent } from "../../utils/name/makeLabelNodeAndParent.js";
import { namehash } from "../../utils/name/normalize.js";

export type DeleteSubnameParameters = {
	/** Subname to delete */
	name: string;
	/** Contract to delete subname on */
	contract: "registry" | "nameWrapper";
	/** If true, deletes via owner methods, otherwise will delete via parent owner methods */
	asOwner?: boolean;
};

type ChainWithContractDependencies = ChainWithContract<
	"ensRegistry" | "ensNameWrapper"
>;
export type DeleteSubnameOptions<
	chain extends ChainWithContractDependencies | undefined,
	account extends Account | undefined,
	chainOverride extends ChainWithContractDependencies | undefined,
> = Prettify<
	DeleteSubnameParameters &
		WriteTransactionParameters<chain, account, chainOverride>
>;

export type DeleteSubnameReturnType = Hash;

export type DeleteSubnameErrorType =
	| InvalidContractTypeError
	| UnsupportedNameTypeError
	| Error;

export const deleteSubnameWriteParameters = <
	chain extends ChainWithContractDependencies,
	account extends Account,
>(
	client: Client<Transport, chain, account>,
	{ name, contract, asOwner }: DeleteSubnameParameters,
) => {
	const nameType = getNameType(name);
	if (nameType !== "eth-subname" && nameType !== "other-subname")
		throw new UnsupportedNameTypeError({
			nameType,
			supportedNameTypes: ["eth-subname", "other-subname"],
			details: "Cannot delete a name that is not a subname",
		});

	switch (contract) {
		case "registry": {
			const baseParams = {
				address: getChainContractAddress({
					client,
					contract: "ensRegistry",
				}),
				chain: client.chain,
				account: client.account,
			} as const;
			if (asOwner)
				return {
					...baseParams,
					abi: registrySetRecordSnippet,
					functionName: "setRecord",
					args: [namehash(name), zeroAddress, zeroAddress, BigInt(0)],
				} as const satisfies WriteContractParameters<
					typeof registrySetRecordSnippet
				>;

			const { labelhash, parentNode } = makeLabelNodeAndParent(name);
			return {
				...baseParams,
				abi: registrySetSubnodeRecordSnippet,
				functionName: "setSubnodeRecord",
				args: [parentNode, labelhash, zeroAddress, zeroAddress, BigInt(0)],
			} as const satisfies WriteContractParameters<
				typeof registrySetSubnodeRecordSnippet
			>;
		}
		case "nameWrapper": {
			const baseParams = {
				address: getChainContractAddress({
					client,
					contract: "ensNameWrapper",
				}),
				chain: client.chain,
				account: client.account,
			} as const;
			if (asOwner)
				return {
					...baseParams,
					abi: nameWrapperSetRecordSnippet,
					functionName: "setRecord",
					args: [namehash(name), zeroAddress, zeroAddress, BigInt(0)],
				} as const satisfies WriteContractParameters<
					typeof nameWrapperSetRecordSnippet
				>;

			const { label, parentNode } = makeLabelNodeAndParent(name);
			return {
				...baseParams,
				abi: nameWrapperSetSubnodeRecordSnippet,
				functionName: "setSubnodeRecord",
				args: [
					parentNode,
					label,
					zeroAddress,
					zeroAddress,
					BigInt(0),
					0,
					BigInt(0),
				],
			} as const satisfies WriteContractParameters<
				typeof nameWrapperSetSubnodeRecordSnippet
			>;
		}
		default:
			throw new InvalidContractTypeError({
				contractType: contract,
				supportedContractTypes: ["registry", "nameWrapper"],
			});
	}
};

/**
 * Deletes a subname
 * @param client - {@link Client}
 * @param options - {@link DeleteSubnameOptions}
 * @returns Transaction hash. {@link DeleteSubnameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { deleteSubname } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: mainnetWithEns,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await deleteSubname(wallet, {
 *   name: 'sub.ens.eth',
 *   contract: 'registry',
 * })
 * // 0x...
 */
export async function deleteSubname<
	chain extends ChainWithContractDependencies | undefined,
	account extends Account | undefined,
	chainOverride extends ChainWithContractDependencies | undefined,
>(
	client: Client<Transport, chain, account>,
	{
		name,
		contract,
		asOwner,
		...txArgs
	}: DeleteSubnameOptions<chain, account, chainOverride>,
): Promise<DeleteSubnameReturnType> {
	const data = deleteSubnameWriteParameters(
		clientWithOverrides(client, txArgs),
		{
			name,
			contract,
			asOwner,
		} as DeleteSubnameParameters,
	);
	const writeContractAction = getAction(client, writeContract, "writeContract");
	return writeContractAction({
		...data,
		...txArgs,
	} as WriteContractParameters);
}
