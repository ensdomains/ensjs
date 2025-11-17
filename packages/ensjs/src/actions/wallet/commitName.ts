import type {
  Account,
  Chain,
  GetChainContractAddressErrorType,
  Hash,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import {
  type ChainWithContracts,
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import { l2EthRegistrarCommitSnippet } from '../../contracts/l2EthRegistrar.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import type { Prettify, WriteTransactionParameters } from '../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../utils/clientWithOverrides.js'
import {
  type L2RegistrationParameters,
  type MakeL2CommitmentErrorType,
  makeL2Commitment,
} from '../../utils/l2RegisterHelpers.js'
import { getNameType } from '../../utils/name/getNameType.js'
import {
  type WrappedLabelLengthCheckErrorType,
  wrappedLabelLengthCheck,
} from '../../utils/wrapper.js'

// ================================
// Write Parameters
// ================================

export type CommitNameWriteParametersParameters = L2RegistrationParameters

export type CommitNameWriteParametersReturnType<
  chain extends Chain,
  account extends Account,
> = ReturnType<typeof commitNameWriteParameters<chain, account>>

export type CommitNameWriteParametersErrorType =
  | UnsupportedNameTypeError
  | WrappedLabelLengthCheckErrorType
  | GetChainContractAddressErrorType
  | MakeL2CommitmentErrorType

export const commitNameWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<chain, 'ensL2EthRegistrar', account>,
  args: CommitNameWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const labels = args.name.split('.')
  const nameType = getNameType(args.name)
  if (nameType !== 'eth-2ld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld'],
      details: 'Only 2ld-eth name registration is supported',
    })
  wrappedLabelLengthCheck(labels[0])
  return {
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensL2EthRegistrar',
    }),
    abi: l2EthRegistrarCommitSnippet,
    functionName: 'commit',
    args: [makeL2Commitment(args)],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof l2EthRegistrarCommitSnippet
  >
}

// ================================
// Action
// ================================

export type CommitNameParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensL2EthRegistrar'> | undefined,
> = Prettify<
  CommitNameWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type CommitNameReturnType = Hash

export type CommitNameErrorType =
  | CommitNameWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Commits a name to be registered
 * @param client - {@link Client}
 * @param options - {@link CommitNameOptions}
 * @returns Transaction hash. {@link CommitNameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { commitName } from '@ensdomains/ensjs/wallet'
 * import { randomSecret } from '@ensdomains/ensjs/utils'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const secret = randomSecret()
 * const hash = await commitName(wallet, {
 *   name: 'example.eth',
 *   owner: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
 *   duration: 31536000, // 1 year
 *   secret,
 * })
 * // 0x...
 */
export async function commitName<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensL2EthRegistrar'> | undefined,
>(
  client: RequireClientContracts<chain, 'ensL2EthRegistrar', account>,
  {
    name,
    owner,
    duration,
    secret,
    resolverAddress,
    subregistryAddress,
    referrer,
    ...txArgs
  }: CommitNameParameters<chain, account, chainOverride>,
): Promise<CommitNameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = commitNameWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      name,
      owner,
      duration,
      secret,
      resolverAddress,
      subregistryAddress,
      referrer,
    },
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
