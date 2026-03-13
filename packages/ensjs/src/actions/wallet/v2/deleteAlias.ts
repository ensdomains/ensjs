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
import { packetToBytes } from 'viem/ens'
import { getAction, toHex } from 'viem/utils'
import { permissionedResolverAliasSnippet } from '../../../contracts/permissionedRegistry.js'
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

export type DeleteAliasWriteParametersParameters = {
  /** The source name to remove the alias from */
  fromName: string
  /** The resolver address */
  resolverAddress: Address
}

export type DeleteAliasWriteParametersReturnType = ReturnType<
  typeof deleteAliasWriteParameters
>

export const deleteAliasWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  { fromName, resolverAddress }: DeleteAliasWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const fromNameEncoded = toHex(packetToBytes(fromName))

  return {
    address: resolverAddress,
    abi: permissionedResolverAliasSnippet,
    functionName: 'setAlias',
    args: [fromNameEncoded, '0x'],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof permissionedResolverAliasSnippet
  >
}

// ================================
// Action
// ================================

export type DeleteAliasParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  DeleteAliasWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type DeleteAliasReturnType = Hash

export type DeleteAliasErrorType =
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Deletes an alias by setting its target to empty bytes (V2).
 *
 * @param client - {@link Client}
 * @param parameters - {@link DeleteAliasParameters}
 * @returns Transaction hash. {@link DeleteAliasReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { deleteAlias } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await deleteAlias(wallet, {
 *   fromName: 'alias.eth',
 *   resolverAddress: '0x...',
 * })
 * // 0x...
 */
export async function deleteAlias<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    fromName,
    resolverAddress,
    ...txArgs
  }: DeleteAliasParameters<chain, account, chainOverride>,
): Promise<DeleteAliasReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = deleteAliasWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      fromName,
      resolverAddress,
    },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
