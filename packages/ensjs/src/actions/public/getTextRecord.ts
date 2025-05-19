import type {
  Chain,
  Client,
  EncodeFunctionDataErrorType,
  Transport,
} from 'viem'
import { encodeFunctionData, getAction } from 'viem/utils'
import type { ChainWithContract } from '../../contracts/consts.js'
import type { Prettify } from '../../types/index.js'
import {
  type DecodeTextResultErrorType,
  type DecodeTextResultParameters,
  type DecodeTextResultReturnType,
  decodeTextResult,
  type GetTextParametersErrorType,
  type GetTextParametersParameters,
  getTextParameters,
} from '../../utils/coders/getText.js'
import {
  type ResolveNameDataErrorType,
  resolveNameData,
} from './resolveNameData.js'
import type { RequireClientContracts } from '../../clients/chain.js'
import { UNWRAP_TYPE_ERROR } from '../../types/internal.js'

export type GetTextRecordParameters = Prettify<
  GetTextParametersParameters &
    DecodeTextResultParameters & {
      /** Batch gateway URLs to use for resolving CCIP-read requests. */
      gatewayUrls?: string[]
    }
>

export type GetTextRecordReturnType = DecodeTextResultReturnType

export type GetTextRecordErrorType =
  | ResolveNameDataErrorType
  | EncodeFunctionDataErrorType
  | GetTextParametersErrorType
  | DecodeTextResultErrorType

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
export async function getTextRecord<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensUniversalResolver'>,
  { gatewayUrls, strict, ...parameters }: GetTextRecordParameters,
): Promise<GetTextRecordReturnType> {
  UNWRAP_TYPE_ERROR(client)

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
