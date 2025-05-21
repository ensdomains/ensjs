import type {
	Account,
	Chain,
	GetChainContractAddressErrorType,
	Prettify,
	WriteContractErrorType,
	WriteContractParameters,
	WriteContractReturnType,
} from "viem";
import { writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import {
	getChainContractAddress,
	type RequireClientContracts,
} from "../../clients/chain.js";
import type { ChainWithContract } from "../../contracts/consts.js";
import { ethRegistrarControllerRegisterSnippet } from "../../contracts/ethRegistrarController.js";
import { UnsupportedNameTypeError } from "../../errors/general.js";
import type { WriteTransactionParameters } from "../../types/index.js";
import { ASSERT_NO_TYPE_ERROR } from "../../types/internal.js";
import {
	type ClientWithOverridesErrorType,
	clientWithOverrides,
} from "../../utils/clientWithOverrides.js";
import { getNameType } from "../../utils/name/getNameType.js";
import {
	type MakeRegistrationTupleErrorType,
	makeRegistrationTuple,
	type RegistrationParameters,
} from "../../utils/registerHelpers.js";
import {
	type WrappedLabelLengthCheckErrorType,
	wrappedLabelLengthCheck,
} from "../../utils/wrapper.js";

// ================================
// Write parameters
// ================================

export type RegisterNameWriteParametersParameters = RegistrationParameters & {
	/** Value of registration */
	value: bigint;
};

export type RegisterNameWriteParametersReturnType = ReturnType<
	typeof registerNameWriteParameters
>;

export type RegisterNameWriteParametersErrorType =
	| UnsupportedNameTypeError
	| GetChainContractAddressErrorType
	| WrappedLabelLengthCheckErrorType
	| MakeRegistrationTupleErrorType;

export const registerNameWriteParameters = <
	chain extends Chain,
	account extends Account,
>(
	client: RequireClientContracts<chain, "ensEthRegistrarController", account>,
	{ value, ...args }: RegisterNameWriteParametersParameters,
) => {
	ASSERT_NO_TYPE_ERROR(client);

	const nameType = getNameType(args.name);
	if (nameType !== "eth-2ld")
		throw new UnsupportedNameTypeError({
			nameType,
			supportedNameTypes: ["eth-2ld"],
			details: "Only 2ld-eth name registration is supported",
		});

	const labels = args.name.split(".");
	wrappedLabelLengthCheck(labels[0]);

	return {
		address: getChainContractAddress({
			chain: client.chain,
			contract: "ensEthRegistrarController",
		}),
		abi: ethRegistrarControllerRegisterSnippet,
		functionName: "register",
		args: makeRegistrationTuple(args),
		chain: client.chain,
		account: client.account,
		value,
	} as const satisfies WriteContractParameters<
		typeof ethRegistrarControllerRegisterSnippet
	>;
};

// ================================
// Register name action
// ================================

export type RegisterNameParameters<
	chain extends Chain,
	account extends Account,
	chainOverride extends
		| ChainWithContract<"ensEthRegistrarController">
		| undefined,
> = Prettify<
	RegisterNameWriteParametersParameters &
		WriteTransactionParameters<chain, account, chainOverride>
>;

export type RegisterNameReturnType = WriteContractReturnType;

export type RegisterNameErrorType =
	| RegisterNameWriteParametersErrorType
	| ClientWithOverridesErrorType
	| WriteContractErrorType;

/**
 * Registers a name on ENS
 * @param client - {@link Client}
 * @param options - {@link RegisterNameOptions}
 * @returns Transaction hash. {@link RegisterNameReturnType}
 *
 * @example
 * import { createPublicClient, createWalletClient, http, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getPrice } from '@ensdomains/ensjs/public'
 * import { randomSecret } from '@ensdomains/ensjs/utils'
 * import { commitName, registerName } from '@ensdomains/ensjs/wallet'
 *
 * const mainnetWithEns = addEnsContracts(mainnet)
 * const publicClient = createPublicClient({
 *   chain: mainnetWithEns,
 *   transport: http(),
 * })
 * const wallet = createWalletClient({
 *   chain: mainnetWithEns,
 *   transport: custom(window.ethereum),
 * })
 * const secret = randomSecret()
 * const params = {
 *   name: 'example.eth',
 *   owner: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
 *   duration: 31536000, // 1 year
 *   secret,
 * }
 *
 * const commitmentHash = await commitName(wallet, params)
 * await publicClient.waitForTransactionReceipt({ hash: commitmentHash }) // wait for commitment to finalise
 * await new Promise((resolve) => setTimeout(resolve, 60 * 1_000)) // wait for commitment to be valid
 *
 * const { base, premium } = await getPrice(publicClient, { nameOrNames: params.name, duration: params.duration })
 * const value = (base + premium) * 110n / 100n // add 10% to the price for buffer
 * const hash = await registerName(wallet, { ...params, value })
 * // 0x...
 */
export async function registerName<
	chain extends Chain,
	account extends Account,
	chainOverride extends
		| ChainWithContract<"ensEthRegistrarController">
		| undefined,
>(
	client: RequireClientContracts<chain, "ensEthRegistrarController", account>,
	{
		name,
		owner,
		duration,
		secret,
		resolverAddress,
		records,
		reverseRecord,
		fuses,
		value,
		...txArgs
	}: RegisterNameParameters<chain, account, chainOverride>,
): Promise<RegisterNameReturnType> {
	ASSERT_NO_TYPE_ERROR(client);

	const writeParameters = registerNameWriteParameters(
		clientWithOverrides(client, txArgs),
		{
			name,
			owner,
			duration,
			secret,
			resolverAddress,
			records,
			reverseRecord,
			fuses,
			value,
		},
	);
	const writeContractAction = getAction(client, writeContract, "writeContract");
	return writeContractAction({
		...writeParameters,
		...txArgs,
	} as WriteContractParameters);
}
