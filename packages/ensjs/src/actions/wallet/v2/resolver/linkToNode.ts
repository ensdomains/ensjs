import { permissionedResolverLinkToNodeSnippet } from '@ensdomains/ensjs-abi/v2/permissionedResolver'
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
import { type NamehashErrorType, namehash } from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../../utils/clientWithOverrides.js'
import { dnsEncodeName } from '../../../../utils/v2/resolver/recordParameters.js'

// ================================
// Write parameters
// ================================

export type LinkToNodeWriteParametersParameters = {
  /** The name that should start serving the target's records */
  sourceName: string
  /** The name whose current record the source should use */
  targetName: string
  /** The resolver address */
  resolverAddress: Address
}

export type LinkToNodeWriteParametersReturnType = ReturnType<
  typeof linkToNodeWriteParameters
>

export const linkToNodeWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    sourceName,
    targetName,
    resolverAddress,
  }: LinkToNodeWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  return {
    address: resolverAddress,
    abi: permissionedResolverLinkToNodeSnippet,
    functionName: 'linkToNode',
    args: [dnsEncodeName(sourceName), namehash(targetName)],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof permissionedResolverLinkToNodeSnippet
  >
}

// ================================
// Action
// ================================

export type LinkToNodeParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  LinkToNodeWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type LinkToNodeReturnType = Hash

export type LinkToNodeErrorType =
  | ClientWithOverridesErrorType
  | WriteContractErrorType
  | NamehashErrorType

/**
 * Links a name to the record another name currently uses on a
 * PermissionedResolver (V2), so both names serve the same records.
 *
 * Requires `ROLE_LINK` on the resolver's root resource. Reverts with
 * `InvalidRecord` if the target name has no record on this resolver yet.
 *
 * @param client - {@link Client}
 * @param parameters - {@link LinkToNodeParameters}
 * @returns Transaction hash. {@link LinkToNodeReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { linkToNode } from '@ensdomains/ensjs/wallet/v2'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await linkToNode(wallet, {
 *   sourceName: 'alias.eth',
 *   targetName: 'target.eth',
 *   resolverAddress: '0x...',
 * })
 * // 0x...
 */
export async function linkToNode<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    sourceName,
    targetName,
    resolverAddress,
    ...txArgs
  }: LinkToNodeParameters<chain, account, chainOverride>,
): Promise<LinkToNodeReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = linkToNodeWriteParameters(
    clientWithOverrides(client, txArgs),
    { sourceName, targetName, resolverAddress },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
