import type { Client, Transport } from 'viem'
import { encodeFunctionData, getAction } from 'viem/utils'

import type { ChainWithContract } from '../../contracts/consts.js'
import type { Prettify } from '../../types.js'
import {
  decodeAddressResult,
  getAddressParameters,
  type GetAddressErrorType,
  type GetAddressParameters,
  type GetAddressReturnType,
} from '../../utils/coders/getAddress.js'
import { resolveNameData } from './resolveNameData.js'

export type GetAddressRecordParameters<
  coin extends string | number | undefined = undefined,
> = Prettify<
  GetAddressParameters<coin> & {
    /** Batch gateway URLs to use for resolving CCIP-read requests. */
    gatewayUrls?: string[]
  }
>

export type GetAddressRecordReturnType<
  coin extends string | number | undefined = undefined,
> = GetAddressReturnType<coin>

export type GetAddressRecordErrorType = GetAddressErrorType

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
  chain extends ChainWithContract<'ensUniversalResolver'>,
  coin extends string | number | undefined = undefined,
>(
  client: Client<Transport, chain>,
  {
    gatewayUrls,
    strict,
    name,
    bypassFormat,
    coin,
  }: GetAddressRecordParameters<coin>,
): Promise<GetAddressRecordReturnType<coin>> {
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
