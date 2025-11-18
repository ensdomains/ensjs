import {
  type Account,
  type Chain,
  type GetChainContractAddressErrorType,
  type Hash,
  type WriteContractErrorType,
  type WriteContractParameters,
  zeroAddress,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction, padHex } from 'viem/utils'
import {
  type ChainWithContracts,
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import { l2EthRegistrarRegisterSnippet } from '../../contracts/l2EthRegistrar.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import type { Prettify, WriteTransactionParameters } from '../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../utils/clientWithOverrides.js'
import type {
  L2RegistrationParameters,
  MakeL2CommitmentTupleErrorType,
} from '../../utils/l2RegisterHelpers.js'
import { getNameType } from '../../utils/name/getNameType.js'
import {
  type WrappedLabelLengthCheckErrorType,
  wrappedLabelLengthCheck,
} from '../../utils/wrapper.js'

// ================================
// Write parameters
// ================================

export type RegisterNameWriteParametersParameters = L2RegistrationParameters

export type RegisterNameWriteParametersReturnType<
  chain extends Chain,
  account extends Account,
> = ReturnType<typeof registerNameWriteParameters<chain, account>>

export type RegisterNameWriteParametersErrorType =
  | UnsupportedNameTypeError
  | WrappedLabelLengthCheckErrorType
  | GetChainContractAddressErrorType
  | MakeL2CommitmentTupleErrorType

export const registerNameWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<chain, 'ensL2EthRegistrar' | 'usdc', account>,
  registrationParams: RegisterNameWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const nameType = getNameType(`${registrationParams.label}.eth`)
  if (nameType !== 'eth-2ld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld'],
      details: 'Only 2ld-eth name registration is supported',
    })

  wrappedLabelLengthCheck(registrationParams.label)

  const usdc = getChainContractAddress({
    chain: client.chain,
    contract: 'usdc',
  })

  return {
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensL2EthRegistrar',
    }),
    abi: l2EthRegistrarRegisterSnippet,
    functionName: 'register',
    args: [
      registrationParams.label, // V2 ETHRegistrar expects a label, not a full name
      registrationParams.owner,
      registrationParams.secret,
      registrationParams.subregistryAddress || zeroAddress,
      registrationParams.resolverAddress || zeroAddress,
      BigInt(registrationParams.duration),
      registrationParams.paymentToken || usdc,
      registrationParams.referrer || padHex('0x', { size: 32 }),
    ],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof l2EthRegistrarRegisterSnippet
  >
}

// ================================
// Register name action
// ================================

export type RegisterNameParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensL2EthRegistrar'> | undefined,
> = Prettify<
  RegisterNameWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type RegisterNameReturnType = Hash

export type RegisterNameErrorType =
  | RegisterNameWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

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
  chainOverride extends ChainWithContracts<'ensL2EthRegistrar'> | undefined,
>(
  client: RequireClientContracts<chain, 'ensL2EthRegistrar' | 'usdc', account>,
  {
    label,
    owner,
    duration,
    secret,
    resolverAddress,
    subregistryAddress,
    referrer,
    paymentToken,
    ...txArgs
  }: RegisterNameParameters<chain, account, chainOverride>,
): Promise<RegisterNameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = registerNameWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      label,
      owner,
      duration,
      secret,
      resolverAddress,
      subregistryAddress,
      paymentToken,
      referrer,
    },
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
