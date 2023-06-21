import { Hex } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { Prettify, SimpleTransactionRequest } from '../../types'
import {
  GeneratedFunction,
  generateFunction,
} from '../../utils/generateFunction'
import _getAddr, {
  InternalGetAddrParameters,
  InternalGetAddrReturnType,
} from './_getAddr'
import universalWrapper from './universalWrapper'

export type GetAddrParameters = Prettify<InternalGetAddrParameters>

export type GetAddrReturnType = Prettify<InternalGetAddrReturnType>

const encode = (
  client: ClientWithEns,
  { name, coin }: GetAddrParameters,
): SimpleTransactionRequest => {
  const prData = _getAddr.encode(client, { name, coin })
  return universalWrapper.encode(client, { name, data: prData.data })
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
  args: GetAddrParameters,
): Promise<GetAddrReturnType> => {
  const urData = await universalWrapper.decode(client, data)
  if (!urData) return null
  return _getAddr.decode(client, urData.data, args)
}

type BatchableFunctionObject = GeneratedFunction<typeof encode, typeof decode>

/**
 * Gets an address record for a name and specified coin
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetAddrParameters}
 * @returns Coin value object, or `null` if not found. {@link GetAddrReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addContracts, getAddr } from '@ensdomains/ensjs'
 *
 * const mainnetWithEns = addContracts([mainnet])
 * const client = createPublicClient({
 *   chain: mainnetWithEns,
 *   transport: http(),
 * })
 * const result = await getAddr(client, { name: 'ens.eth', coin: 'ETH' })
 * // { id: 60, name: 'ETH , value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7' }
 */
const getAddr = generateFunction({ encode, decode }) as ((
  client: ClientWithEns,
  { name, coin, bypassFormat }: GetAddrParameters,
) => Promise<GetAddrReturnType>) &
  BatchableFunctionObject

export default getAddr
