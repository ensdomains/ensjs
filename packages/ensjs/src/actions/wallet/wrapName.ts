import {
	encodeAbiParameters,
	labelhash,
	toHex,
	type Account,
	type Address,
	type Client,
	type Transport,
	type WriteContractParameters,
	type WriteContractReturnType,
} from "viem";
import { writeContract } from "viem/actions";
import { packetToBytes } from "viem/ens";
import { getAction } from "viem/utils";
import { baseRegistrarSafeTransferFromWithDataSnippet } from "../../contracts/baseRegistrar.js";
import type { ChainWithContract } from "../../contracts/consts.js";
import { getChainContractAddress } from "../../contracts/getChainContractAddress.js";
import { nameWrapperWrapSnippet } from "../../contracts/nameWrapper.js";
import { AdditionalParameterSpecifiedError } from "../../errors/general.js";
import type { WrappedLabelTooLargeError } from "../../errors/utils.js";
import type {
	Eth2ldNameSpecifier,
	GetNameType,
	WriteTransactionParameters,
} from "../../types/index.js";
import { clientWithOverrides } from "../../utils/clientWithOverrides.js";
import {
	encodeFuses,
	type EncodeChildFusesInputObject,
} from "../../utils/fuses.js";
import { checkIsDotEth } from "../../utils/name/validation.js";
import { wrappedLabelLengthCheck } from "../../utils/wrapper.js";

export type WrapNameParameters<name extends string> = {
	/** The name to wrap */
	name: name;
	/** The recipient of the wrapped name */
	newOwnerAddress: Address;
	/** Fuses to set on wrap (eth-2ld only) */
	fuses?: GetNameType<name> extends Eth2ldNameSpecifier
		? EncodeChildFusesInputObject
		: never;
	/** The resolver address to set on wrap */
	resolverAddress?: Address;
};

type ChainWithContractDependencies = ChainWithContract<
	"ensPublicResolver" | "ensNameWrapper" | "ensBaseRegistrarImplementation"
>;
export type WrapNameOptions<
	name extends string,
	chain extends ChainWithContractDependencies | undefined,
	account extends Account | undefined,
	chainOverride extends ChainWithContractDependencies | undefined,
> = WrapNameParameters<name> &
	WriteTransactionParameters<chain, account, chainOverride>;

export type WrapNameReturnType = WriteContractReturnType;

export type WrapNameErrorType =
	| AdditionalParameterSpecifiedError
	| WrappedLabelTooLargeError
	| Error;

export const wrapNameWriteParameters = <
	name extends string,
	chain extends ChainWithContractDependencies,
	account extends Account,
>(
	client: Client<Transport, chain, account>,
	{
		name,
		newOwnerAddress,
		fuses,
		resolverAddress = getChainContractAddress({
			client,
			contract: "ensPublicResolver",
		}),
	}: WrapNameParameters<name>,
) => {
	const labels = name.split(".");
	const isEth2ld = checkIsDotEth(labels);

	const nameWrapperAddress = getChainContractAddress({
		client,
		contract: "ensNameWrapper",
	});

	if (isEth2ld) {
		wrappedLabelLengthCheck(labels[0]);
		const encodedFuses = fuses
			? encodeFuses({ restriction: "child", input: fuses })
			: 0;
		const tokenId = BigInt(labelhash(labels[0]));

		const data = encodeAbiParameters(
			[
				{ name: "label", type: "string" },
				{ name: "wrappedOwner", type: "address" },
				{ name: "ownerControlledFuses", type: "uint16" },
				{ name: "resolverAddress", type: "address" },
			],
			[labels[0], newOwnerAddress, encodedFuses, resolverAddress],
		);

		return {
			address: getChainContractAddress({
				client,
				contract: "ensBaseRegistrarImplementation",
			}),
			abi: baseRegistrarSafeTransferFromWithDataSnippet,
			functionName: "safeTransferFrom",
			args: [client.account.address, nameWrapperAddress, tokenId, data],
			chain: client.chain,
			account: client.account,
		} as const satisfies WriteContractParameters<
			typeof baseRegistrarSafeTransferFromWithDataSnippet
		>;
	}

	if (fuses)
		throw new AdditionalParameterSpecifiedError({
			parameter: "fuses",
			allowedParameters: ["name", "wrappedOwner", "resolverAddress"],
			details: "Fuses cannot be initially set when wrapping non eth-2ld names",
		});

	labels.forEach((label) => wrappedLabelLengthCheck(label));
	return {
		address: nameWrapperAddress,
		abi: nameWrapperWrapSnippet,
		functionName: "wrap",
		args: [toHex(packetToBytes(name)), newOwnerAddress, resolverAddress],
		chain: client.chain,
		account: client.account,
	} as const satisfies WriteContractParameters<typeof nameWrapperWrapSnippet>;
};

/**
 * Wraps a name.
 * @param client - {@link Client}
 * @param options - {@link WrapNameOptions}
 * @returns Transaction hash. {@link WrapNameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { wrapName } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await wrapName(wallet, {
 *   name: 'ens.eth',
 *   newOwnerAddress: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
 * })
 * // 0x...
 */
export async function wrapName<
	name extends string,
	chain extends ChainWithContractDependencies | undefined,
	account extends Account | undefined,
	chainOverride extends ChainWithContractDependencies | undefined,
>(
	client: Client<Transport, chain, account>,
	{
		name,
		newOwnerAddress,
		fuses,
		resolverAddress,
		...txArgs
	}: WrapNameOptions<name, chain, account, chainOverride>,
): Promise<WrapNameReturnType> {
	const writeParameters = wrapNameWriteParameters(
		clientWithOverrides(client, txArgs),
		{
			name,
			newOwnerAddress,
			fuses,
			resolverAddress,
		},
	);

	const writeContractAction = getAction(client, writeContract, "writeContract");
	return writeContractAction({
		...writeParameters,
		...txArgs,
	} as WriteContractParameters);
}
