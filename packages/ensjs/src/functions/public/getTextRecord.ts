import type { Client, Transport } from 'viem'

import { encodeFunctionData, getAction } from 'viem/utils'
import type { ChainWithContract } from '../../contracts/consts.js'
import type { Prettify } from '../../types.js'
import {
  decodeTextResult,
  getTextParameters,
  type GetTextErrorType,
  type GetTextParameters,
  type GetTextReturnType,
} from '../../utils/coders/getText.js'
import { resolveNameData } from './resolveNameData.js'

export type GetTextRecordParameters = Prettify<
  GetTextParameters & {
    /** Batch gateway URLs to use for resolving CCIP-read requests. */
    gatewayUrls?: string[]
  }
>

export type GetTextRecordReturnType = GetTextReturnType

export type GetTextRecordErrorType = GetTextErrorType

/**
 * Gets a text record for a name.
 * @param client - {@link Client}
 * @param parameters - {@link GetTextRecordParameters}
 * @returns Text record string, or null if none is found. {@link GetTextRecordReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getTextRecord } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getTextRecord(client, { name: 'ens.eth', key: 'com.twitter' })
 * // ensdomains
 */
export async function getTextRecord<
  chain extends ChainWithContract<'ensUniversalResolver'>,
>(
  client: Client<Transport, chain>,
  { gatewayUrls, strict, ...parameters }: GetTextRecordParameters,
): Promise<GetTextRecordReturnType> {
  const resolveNameDataAction = getAction(
    client,
    resolveNameData,
    'resolveNameData',
  )
  const result = await resolveNameDataAction({
    name: parameters.name,
    data: encodeFunctionData(getTextParameters(parameters)),
    gatewayUrls,
    strict,
  })
  if (!result) return null
  return decodeTextResult(result.resolvedData, { strict })
}
