import type {
  Account,
  Address,
  Chain,
  Client,
  Hash,
  Transport,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../utils/clientWithOverrides.js'
import { deleteSubnameV2WriteParameters } from './deleteSubname.js'

// ================================
// Write parameters
// ================================

export type DeleteSubnamesV2WriteParametersParameters = {
  /** The parent registry address */
  registryAddress: Address
  /** The labels of the subnames to delete */
  labels: string[]
}

// ================================
// Action
// ================================

export type DeleteSubnamesV2Parameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  DeleteSubnamesV2WriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type DeleteSubnamesV2ReturnType = Hash[]

export type DeleteSubnamesV2ErrorType =
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Deletes multiple subnames by calling `unregister()` for each one on the parent registry.
 *
 * In ENSv2 there is no batch unregister — each subname requires a separate
 * `unregister()` call. This function sends them sequentially (each tx is awaited
 * before the next is signed) and returns their hashes in input order. The caller
 * must have ROLE_UNREGISTER on each name's resource or on ROOT_RESOURCE.
 *
 * For REGISTERED names this burns the ERC1155 token and invalidates roles;
 * RESERVED names are unregistered without a burn. In both cases the name becomes
 * AVAILABLE. Resolver records, linked subregistries, and deeper subnames are not
 * cleaned up automatically.
 *
 * @param client - {@link Client}
 * @param parameters - {@link DeleteSubnamesV2Parameters}
 * @returns Array of transaction hashes. {@link DeleteSubnamesV2ReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { deleteSubnamesV2 } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hashes = await deleteSubnamesV2(wallet, {
 *   registryAddress: '0x...', // parent registry
 *   labels: ['sub1', 'sub2', 'sub3'],
 * })
 * // ['0x...', '0x...', '0x...']
 */
export async function deleteSubnamesV2<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    labels,
    ...txArgs
  }: DeleteSubnamesV2Parameters<chain, account, chainOverride>,
): Promise<DeleteSubnamesV2ReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const overriddenClient = clientWithOverrides(client, txArgs)
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  const hashes: Hash[] = []

  for (const label of labels) {
    const writeParameters = deleteSubnameV2WriteParameters(overriddenClient, {
      registryAddress,
      label,
    })
    const hash = await writeContractAction({
      ...writeParameters,
      ...txArgs,
    } as WriteContractParameters)
    hashes.push(hash)
  }

  return hashes
}
