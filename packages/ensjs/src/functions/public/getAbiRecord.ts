import type { Client, Transport } from 'viem'
import { encodeFunctionData, getAction } from 'viem/utils'

import type { ChainWithContract } from '../../contracts/consts.js'
import type { Prettify } from '../../types.js'
import {
  decodeAbiResult,
  getAbiParameters,
  type GetAbiErrorType,
  type GetAbiParameters,
  type GetAbiReturnType,
} from '../../utils/coders/getAbi.js'
import { resolveNameData } from './resolveNameData.js'

export type GetAbiRecordParameters = Prettify<
  GetAbiParameters & {
    /** Batch gateway URLs to use for resolving CCIP-read requests. */
    gatewayUrls?: string[]
  }
>

export type GetAbiRecordReturnType = GetAbiReturnType

export type GetAbiRecordErrorType = GetAbiErrorType

/**
 * Gets the ABI record for a name
 * @param client - {@link Client}
 * @param parameters - {@link GetAbiRecordParameters}
 * @returns ABI record for the name, or `null` if not found. {@link GetAbiRecordReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getAbiRecord } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getAbiRecord(client, { name: 'ens.eth' })
 * // TODO: real example
 */
export async function getAbiRecord<
  chain extends ChainWithContract<'ensUniversalResolver'>,
>(
  client: Client<Transport, chain>,
  { gatewayUrls, name, supportedContentTypes, strict }: GetAbiRecordParameters,
): Promise<GetAbiRecordReturnType> {
  const resolveNameDataAction = getAction(
    client,
    resolveNameData,
    'resolveNameData',
  )
  const result = await resolveNameDataAction({
    name,
    data: encodeFunctionData(getAbiParameters({ name, supportedContentTypes })),
    gatewayUrls,
    strict,
  })
  if (!result) return null
  return decodeAbiResult(result.resolvedData, { strict })
}
