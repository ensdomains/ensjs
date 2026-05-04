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
import { labelhash } from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { standardRegistryUnregisterSnippet } from '../../../contracts/standardRegistry.js'
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../utils/clientWithOverrides.js'

// ================================
// Write parameters
// ================================

export type DeleteSubnameWriteParametersParameters = {
  /** The parent registry address that contains the subname */
  registryAddress: Address
  /** The label of the subname to delete (e.g. "sub" for sub.example.eth) */
  label: string
}

export type DeleteSubnameWriteParametersReturnType = ReturnType<
  typeof deleteSubnameWriteParameters
>

export const deleteSubnameWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  { registryAddress, label }: DeleteSubnameWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  return {
    address: registryAddress,
    abi: standardRegistryUnregisterSnippet,
    functionName: 'unregister',
    args: [BigInt(labelhash(label))],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof standardRegistryUnregisterSnippet
  >
}

// ================================
// Action
// ================================

export type DeleteSubnameParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  DeleteSubnameWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type DeleteSubnameReturnType = Hash

export type DeleteSubnameErrorType =
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Deletes a subname by calling `unregister()` on the parent registry.
 *
 * In ENSv2, subnames are managed by their parent registry (PermissionedRegistry).
 * The caller must have ROLE_UNREGISTER on the name's resource or on ROOT_RESOURCE.
 * If the name is REGISTERED, this burns the ERC1155 token and invalidates all
 * roles on its resource (via an `eacVersionId` + `tokenVersionId` bump).
 * If the name is RESERVED, no burn or version bump occurs. In both cases the
 * name becomes AVAILABLE immediately.
 *
 * Note: unregistering does not clear resolver records, the linked subregistry,
 * or any deeper subnames — those must be cleaned up separately.
 *
 * @param client - {@link Client}
 * @param parameters - {@link DeleteSubnameParameters}
 * @returns Transaction hash. {@link DeleteSubnameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { deleteSubname } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await deleteSubname(wallet, {
 *   registryAddress: '0x...', // parent registry (e.g. example.eth's UserRegistry)
 *   label: 'sub',             // deletes sub.example.eth
 * })
 * // 0x...
 */
export async function deleteSubname<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    label,
    ...txArgs
  }: DeleteSubnameParameters<chain, account, chainOverride>,
): Promise<DeleteSubnameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = deleteSubnameWriteParameters(
    clientWithOverrides(client, txArgs),
    { registryAddress, label },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
