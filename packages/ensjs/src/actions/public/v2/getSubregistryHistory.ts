import type { Client, GetLogsErrorType, GetLogsParameters } from 'viem'
import type { Address } from 'viem/accounts'
import { getLogs } from 'viem/actions'
import { getAction } from 'viem/utils'
import { subregistryUpdateEventSnippet } from '../../../contracts/userRegistry.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { labelToCanonicalId } from '../../../utils/v2/registry/labelToCanonicalId.js'

export type GetSubregistryHistoryParameters = {
  /** The registry address to query */
  registryAddress: Address
  /** The label to get subregistry history for */
  label: string
} & Pick<GetLogsParameters, 'fromBlock' | 'toBlock'>

export type SubregistryHistoryEntry = {
  tokenId: bigint
  subregistry: Address
}

export type GetSubregistryHistoryReturnType = SubregistryHistoryEntry[]

export type GetSubregistryHistoryErrorType = GetLogsErrorType

/**
 * Get the subregistry update history for a name.
 * @param client - {@link Client}
 * @param parameters - {@link GetSubregistryHistoryParameters}
 * @returns Array of subregistry history entries. {@link GetSubregistryHistoryReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getSubregistryHistory } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const history = await getSubregistryHistory(client, {
 *   registryAddress: '0x...',
 *   label: 'example',
 *   fromBlock: 0n,
 * })
 * // [{ tokenId: 456n, subregistry: '0x...' }]
 */
export async function getSubregistryHistory(
  client: Client,
  { registryAddress, label, ...params }: GetSubregistryHistoryParameters,
): Promise<GetSubregistryHistoryReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const getLogsAction = getAction(client, getLogs, 'getLogs')

  const tokenId = labelToCanonicalId(label)

  const logs = await getLogsAction({
    ...params,
    address: registryAddress,
    events: subregistryUpdateEventSnippet,
    // @ts-expect-error viem type error
    args: {
      id: tokenId,
    },
  })

  // Map logs to structured history entries
  return logs
    .filter(
      (log) => log.args.id !== undefined && log.args.subregistry !== undefined,
    )
    .map((log) => ({
      tokenId: log.args.id as bigint,
      subregistry: log.args.subregistry as Address,
    }))
}
