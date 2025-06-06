import type {
	Account,
	Chain,
	GetChainContractAddressErrorType,
	Hash,
	WriteContractErrorType,
	WriteContractParameters,
} from "viem";
import { writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import { l2EthRegistrarRegisterSnippet } from "../../contracts/l2EthRegistrar.js";
import { UnsupportedNameTypeError } from "../../errors/general.js";
import type { Prettify, WriteTransactionParameters } from "../../types/index.js";
import {
	clientWithOverrides,
	type ClientWithOverridesErrorType,
} from "../../utils/clientWithOverrides.js";
import { getNameType } from "../../utils/name/getNameType.js";
import {
	type L2RegistrationParameters,
	makeL2CommitmentTuple,
	type MakeL2CommitmentTupleErrorType,
} from "../../utils/l2RegisterHelpers.js";
import {
	wrappedLabelLengthCheck,
	type WrappedLabelLengthCheckErrorType,
} from "../../utils/wrapper.js";
import {
	getChainContractAddress,
	type ChainWithContracts,
	type RequireClientContracts,
} from "../../clients/chain.js";
import { ASSERT_NO_TYPE_ERROR } from "../../types/internal.js";

// ================================
// Write parameters
// ================================

export type RegisterNameWriteParametersParameters = L2RegistrationParameters & {
	/** Value of registration */
	value: bigint;
};

export type RegisterNameWriteParametersReturnType<
	chain extends Chain,
	account extends Account,
> = ReturnType<typeof registerNameWriteParameters<chain, account>>;

export type RegisterNameWriteParametersErrorType =
	| UnsupportedNameTypeError
	| WrappedLabelLengthCheckErrorType
	| GetChainContractAddressErrorType
	| MakeL2CommitmentTupleErrorType;

export const registerNameWriteParameters = <
	chain extends Chain,
	account extends Account,
>(
	client: RequireClientContracts<chain, "ensL2EthRegistrar", account>,
	{ value, ...registrationParams }: RegisterNameWriteParametersParameters,
) => {
	ASSERT_NO_TYPE_ERROR(client);

	const nameType = getNameType(registrationParams.name);
	if (nameType !== "eth-2ld")
		throw new UnsupportedNameTypeError({
			nameType,
			supportedNameTypes: ["eth-2ld"],
			details: "Only 2ld-eth name registration is supported",
		});

	const labels = registrationParams.name.split(".");
	wrappedLabelLengthCheck(labels[0]);

	// Use the commitment tuple helper for consistency
	const commitmentTuple = makeL2CommitmentTuple(registrationParams);

	return {
		address: getChainContractAddress({
			chain: client.chain,
			contract: "ensL2EthRegistrar",
		}),
		abi: l2EthRegistrarRegisterSnippet,
		functionName: "register",
		args: commitmentTuple,
		chain: client.chain,
		account: client.account,
		value,
	} as const satisfies WriteContractParameters<
		typeof l2EthRegistrarRegisterSnippet
	>;
};

// ================================
// Register name action
// ================================

export type RegisterNameParameters<
	chain extends Chain,
	account extends Account,
	chainOverride extends
		| ChainWithContracts<"ensL2EthRegistrar">
		| undefined,
> = Prettify<
	RegisterNameWriteParametersParameters &
		WriteTransactionParameters<chain, account, chainOverride>
>;

export type RegisterNameReturnType = Hash;

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
		| ChainWithContracts<"ensL2EthRegistrar">
		| undefined,
>(
	client: RequireClientContracts<chain, "ensL2EthRegistrar", account>,
	{
		name,
		owner,
		duration,
		secret,
		resolverAddress,
		subregistryAddress,
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
			subregistryAddress,
			value,
		},
	);
	const writeContractAction = getAction(client, writeContract, "writeContract");
	return writeContractAction({
		...writeParameters,
		...txArgs,
	} as WriteContractParameters);
}
