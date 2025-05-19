import type { Chain, Client, EncodeFunctionDataErrorType } from 'viem'
import { encodeFunctionData, getAction } from 'viem/utils'
import type { RequireClientContracts } from '../../clients/chain.js'
import type { Prettify } from '../../types/index.js'
import type { ExcludeTE } from '../../types/internal.js'
import {
  type DecodeAbiResultErrorType,
  type DecodeAbiResultParameters,
  type DecodeAbiResultReturnType,
  decodeAbiResult,
  type GetAbiParametersErrorType,
  type GetAbiParametersParameters,
  getAbiParameters,
} from '../../utils/coders/getAbi.js'
import {
  type ResolveNameDataErrorType,
  resolveNameData,
} from './resolveNameData.js'

export type GetAbiRecordParameters = Prettify<
  GetAbiParametersParameters &
    DecodeAbiResultParameters & {
      /** Batch gateway URLs to use for resolving CCIP-read requests. */
      gatewayUrls?: string[]
    }
>

export type GetAbiRecordReturnType = DecodeAbiResultReturnType | null

export type GetAbiRecordErrorType =
  | ResolveNameDataErrorType
  | EncodeFunctionDataErrorType
  | GetAbiParametersErrorType
  | DecodeAbiResultErrorType

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
export async function getAbiRecord<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensUniversalResolver'>,
  { gatewayUrls, name, supportedContentTypes, strict }: GetAbiRecordParameters,
): Promise<GetAbiRecordReturnType> {
  client = client as ExcludeTE<typeof client>

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
