import type {
  Account,
  Chain,
  Client,
  GetChainContractAddressErrorType,
  Hash,
  Transport,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type { ChainWithContract } from '../../contracts/consts.js'
import { ethRegistrarControllerCommitSnippet } from '../../contracts/ethRegistrarController.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import type { WrappedLabelTooLargeError } from '../../errors/utils.js'
import type { Prettify, WriteTransactionParameters } from '../../types/index.js'
import {
  clientWithOverrides,
  type ClientWithOverridesErrorType,
} from '../../utils/clientWithOverrides.js'
import { getNameType } from '../../utils/name/getNameType.js'
import {
  makeCommitment,
  type MakeCommitmentErrorType,
  type RegistrationParameters,
} from '../../utils/registerHelpers.js'
import {
  wrappedLabelLengthCheck,
  type WrappedLabelLengthCheckErrorType,
} from '../../utils/wrapper.js'
import {
  getChainContractAddress,
  type ChainWithContracts,
  type RequireClientContracts,
} from '../../clients/chain.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'

// /** @deprecated */
// export type CommitNameParameters = RegistrationParameters

// /** @deprecated */
// type ChainWithContractDependencies =
//   ChainWithContracts<'ensEthRegistrarController'>

// /** @deprecated */
// export type CommitNameOptions<
//   chain extends ChainWithContractDependencies | undefined,
//   account extends Account | undefined,
//   chainOverride extends ChainWithContractDependencies | undefined,
// > = Prettify<
//   CommitNameParameters &
//     WriteTransactionParameters<chain, account, chainOverride>
// >

// /** @deprecated */
// export type CommitNameReturnType = Hash

// /** @deprecated */
// export type CommitNameErrorType =
//   | UnsupportedNameTypeError
//   | WrappedLabelTooLargeError
//   | Error

// ================================
// Write Parameters
// ================================

export type CommitNameWriteParametersParameters = RegistrationParameters

export type CommitNameWriteParametersReturnType<
  chain extends Chain,
  account extends Account,
> = ReturnType<typeof commitNameWriteParameters<chain, account>>

export type CommitNameWriteParametersErrorType =
  | UnsupportedNameTypeError
  | WrappedLabelLengthCheckErrorType
  | GetChainContractAddressErrorType
  | MakeCommitmentErrorType

export const commitNameWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<chain, 'ensEthRegistrarController', account>,
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
      contract: 'ensEthRegistrarController',
    }),
    abi: ethRegistrarControllerCommitSnippet,
    functionName: 'commit',
    args: [makeCommitment(args)],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof ethRegistrarControllerCommitSnippet
  >
}

// ================================
// Action
// ================================

export type CommitNameParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends
    | ChainWithContracts<'ensEthRegistrarController'>
    | undefined,
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
  chainOverride extends
    | ChainWithContracts<'ensEthRegistrarController'>
    | undefined,
>(
  client: RequireClientContracts<chain, 'ensEthRegistrarController', account>,
  {
    name,
    owner,
    duration,
    secret,
    resolverAddress,
    records,
    reverseRecord,
    fuses,
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
      records,
      reverseRecord,
      fuses,
    },
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
