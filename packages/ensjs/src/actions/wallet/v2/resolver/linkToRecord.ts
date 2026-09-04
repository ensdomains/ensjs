import { permissionedResolverLinkToRecordSnippet } from '@ensdomains/ensjs-abi/v2/permissionedResolver'
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
} from '../../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../../utils/clientWithOverrides.js'
import { dnsEncodeName } from '../../../../utils/v2/resolver/recordParameters.js'

/** The record id that unlinks a name; an unlinked name reads the default record. */
export const UNLINKED_RECORD_ID = 0n

// ================================
// Write parameters
// ================================

export type LinkToRecordWriteParametersParameters = {
  /** The name to re-point */
  sourceName: string
  /**
   * The record id to use, at most `getRecordCount()`. Defaults to
   * {@link UNLINKED_RECORD_ID}, which unlinks the name.
   */
  recordId?: bigint
  /** The resolver address */
  resolverAddress: Address
}

export type LinkToRecordWriteParametersReturnType = ReturnType<
  typeof linkToRecordWriteParameters
>

export const linkToRecordWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    sourceName,
    recordId = UNLINKED_RECORD_ID,
    resolverAddress,
  }: LinkToRecordWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  return {
    address: resolverAddress,
    abi: permissionedResolverLinkToRecordSnippet,
    functionName: 'linkToRecord',
    args: [dnsEncodeName(sourceName), recordId],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof permissionedResolverLinkToRecordSnippet
  >
}

// ================================
// Action
// ================================

export type LinkToRecordParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  LinkToRecordWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type LinkToRecordReturnType = Hash

export type LinkToRecordErrorType =
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Links a name to a record by id on a PermissionedResolver (V2), or unlinks it
 * when `recordId` is omitted or `0`. An unlinked name reads the resolver's
 * default record; the previous record stays on the resolver and can be linked
 * back later. This replaces `clearRecords`.
 *
 * Requires `ROLE_LINK` on the resolver's root resource.
 *
 * @param client - {@link Client}
 * @param parameters - {@link LinkToRecordParameters}
 * @returns Transaction hash. {@link LinkToRecordReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { linkToRecord } from '@ensdomains/ensjs/wallet/v2'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * // Unlink: the name falls back to the default record
 * const hash = await linkToRecord(wallet, {
 *   sourceName: 'alias.eth',
 *   resolverAddress: '0x...',
 * })
 * // 0x...
 */
export async function linkToRecord<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    sourceName,
    recordId,
    resolverAddress,
    ...txArgs
  }: LinkToRecordParameters<chain, account, chainOverride>,
): Promise<LinkToRecordReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = linkToRecordWriteParameters(
    clientWithOverrides(client, txArgs),
    { sourceName, recordId, resolverAddress },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
