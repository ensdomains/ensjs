import type { Chain, EncodeFunctionDataErrorType } from 'viem'
import { encodeFunctionData, getAction } from 'viem/utils'
import type { RequireClientContracts } from '../../clients/chain.js'
import type { Prettify } from '../../types/index.js'
import type { ExcludeTE } from '../../types/internal.js'
import {
  type DecodeAddressResultErrorType,
  type DecodeAddressResultParameters,
  type DecodeAddressResultReturnType,
  decodeAddressResult,
  type GetAddressParametersErrorType,
  type GetAddressParametersParameters,
  getAddressParameters,
} from '../../utils/coders/getAddress.js'
import {
  type ResolveNameDataErrorType,
  resolveNameData,
} from './resolveNameData.js'

export type GetAddressRecordParameters<
  coin extends string | number | undefined = undefined,
> = Prettify<
  GetAddressParametersParameters<coin> &
    DecodeAddressResultParameters<coin> & {
      /** Batch gateway URLs to use for resolving CCIP-read requests. */
      gatewayUrls?: string[]
    }
>

export type GetAddressRecordReturnType<
  coin extends string | number | undefined = undefined,
> = DecodeAddressResultReturnType<coin>

export type GetAddressRecordErrorType =
  | ResolveNameDataErrorType
  | EncodeFunctionDataErrorType
  | GetAddressParametersErrorType
  | DecodeAddressResultErrorType

/**
 * Gets an address record for a name and specified coin
 * @param client - {@link Client}
 * @param parameters - {@link GetAddressRecordParameters}
 * @returns Coin value object, or `null` if not found. {@link GetAddressRecordReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getAddressRecord } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getAddressRecord(client, { name: 'ens.eth', coin: 'ETH' })
 * // { id: 60, name: 'ETH , value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7' }
 */
export async function getAddressRecord<
  chain extends Chain,
  coin extends string | number | undefined = undefined,
>(
  client: RequireClientContracts<chain, 'ensUniversalResolver'>,
  {
    gatewayUrls,
    strict,
    name,
    bypassFormat,
    coin,
  }: GetAddressRecordParameters<coin>,
): Promise<GetAddressRecordReturnType<coin>> {
  client = client as ExcludeTE<typeof client>

  const resolveNameDataAction = getAction(
    client,
    resolveNameData,
    'resolveNameData',
  )
  const result = await resolveNameDataAction({
    name,
    data: encodeFunctionData(
      getAddressParameters({ name, bypassFormat, coin }),
    ),
    gatewayUrls,
    strict,
  })
  if (!result) return null
  return decodeAddressResult(result.resolvedData, { strict, coin })
}
