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

export type DeleteSubnameV2WriteParametersParameters = {
  /** The parent registry address that contains the subname */
  registryAddress: Address
  /** The label of the subname to delete (e.g. "sub" for sub.example.eth) */
  label: string
}

export type DeleteSubnameV2WriteParametersReturnType = ReturnType<
  typeof deleteSubnameV2WriteParameters
>

export const deleteSubnameV2WriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  { registryAddress, label }: DeleteSubnameV2WriteParametersParameters,
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

export type DeleteSubnameV2Parameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  DeleteSubnameV2WriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type DeleteSubnameV2ReturnType = Hash

export type DeleteSubnameV2ErrorType =
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Deletes a subname by calling `unregister()` on the parent registry.
 *
 * In ENSv2, subnames are managed by their parent registry (PermissionedRegistry).
 * The caller must have ROLE_UNREGISTER on the name's resource or on ROOT_RESOURCE.
 * This burns the ERC1155 token, invalidates all roles, and makes the name AVAILABLE.
 *
 * @param client - {@link Client}
 * @param parameters - {@link DeleteSubnameV2Parameters}
 * @returns Transaction hash. {@link DeleteSubnameV2ReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { deleteSubnameV2 } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await deleteSubnameV2(wallet, {
 *   registryAddress: '0x...', // parent registry (e.g. example.eth's UserRegistry)
 *   label: 'sub',             // deletes sub.example.eth
 * })
 * // 0x...
 */
export async function deleteSubnameV2<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    label,
    ...txArgs
  }: DeleteSubnameV2Parameters<chain, account, chainOverride>,
): Promise<DeleteSubnameV2ReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = deleteSubnameV2WriteParameters(
    clientWithOverrides(client, txArgs),
    { registryAddress, label },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
