import { subregistryUpdatedEventSnippet } from '@ensdomains/ensjs-abi/v2/userRegistry'
import {
  type Client,
  type GetLogsErrorType,
  type GetLogsParameters,
  labelhash,
} from 'viem'
import type { Address } from 'viem/accounts'
import { getLogs } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type GetSubregistryHistoryParameters = {
  /** The registry address to query */
  registryAddress: Address
  /** The label to get subregistry history for */
  label: string
} & Partial<Pick<GetLogsParameters, 'fromBlock' | 'toBlock'>>

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
  {
    registryAddress,
    label,
    fromBlock,
    toBlock,
  }: GetSubregistryHistoryParameters,
): Promise<GetSubregistryHistoryReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const getLogsAction = getAction(client, getLogs, 'getLogs')

  const tokenId = BigInt(labelhash(label))

  const logs = await getLogsAction({
    address: registryAddress,
    events: subregistryUpdatedEventSnippet,
    fromBlock: fromBlock ?? 0n,
    toBlock,
  })

  // Map logs to structured history entries
  return logs
    .filter(
      (
        log,
      ): log is typeof log & {
        args: { tokenId: bigint; subregistry: Address }
      } =>
        log.args?.tokenId !== undefined &&
        log.args?.subregistry !== undefined &&
        log.args.tokenId === tokenId,
    )
    .map((log) => ({
      tokenId: log.args.tokenId,
      subregistry: log.args.subregistry,
    }))
}
