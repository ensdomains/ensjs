import type { Client, Transport } from 'viem'
import { encodeFunctionData, getAction } from 'viem/utils'

import type { ChainWithContract } from '../../contracts/consts.js'
import type { Prettify } from '../../types.js'
import {
  decodeContentHashResult,
  getContentHashParameters,
  type GetContentHashErrorType,
  type GetContentHashParameters,
  type GetContentHashReturnType,
} from '../../utils/coders/getContentHash.js'
import { resolveNameData } from './resolveNameData.js'

export type GetContentHashRecordParameters = Prettify<
  GetContentHashParameters & {
    /** Batch gateway URLs to use for resolving CCIP-read requests. */
    gatewayUrls?: string[]
  }
>

export type GetContentHashRecordReturnType = GetContentHashReturnType

export type GetContentHashRecordErrorType = GetContentHashErrorType

/**
 * Gets the content hash record for a name
 * @param client - {@link Client}
 * @param parameters - {@link GetContentHashRecordParameters}
 * @returns Content hash object, or `null` if not found. {@link GetContentHashRecordReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getContentHashRecord } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getContentHashRecord(client, { name: 'ens.eth' })
 * // { protocolType: 'ipfs', decoded: 'k51qzi5uqu5djdczd6zw0grmo23j2vkj9uzvujencg15s5rlkq0ss4ivll8wqw' }
 */
export async function getContentHashRecord<
  chain extends ChainWithContract<'ensUniversalResolver'>,
>(
  client: Client<Transport, chain>,
  { gatewayUrls, name, strict }: GetContentHashRecordParameters,
): Promise<GetContentHashRecordReturnType> {
  const resolveNameDataAction = getAction(
    client,
    resolveNameData,
    'resolveNameData',
  )
  const result = await resolveNameDataAction({
    name,
    data: encodeFunctionData(getContentHashParameters({ name })),
    gatewayUrls,
    strict,
  })
  if (!result) return null
  return decodeContentHashResult(result.resolvedData, { strict })
}
