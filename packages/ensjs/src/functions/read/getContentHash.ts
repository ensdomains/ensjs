import { Hex } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { Prettify, SimpleTransactionRequest } from '../../types'
import {
  GeneratedFunction,
  generateFunction,
} from '../../utils/generateFunction'
import _getContentHash, {
  InternalGetContentHashParameters,
  InternalGetContentHashReturnType,
} from './_getContentHash'
import universalWrapper from './universalWrapper'

export type GetContentHashParameters =
  Prettify<InternalGetContentHashParameters>

export type GetContentHashReturnType =
  Prettify<InternalGetContentHashReturnType>

const encode = (
  client: ClientWithEns,
  { name }: GetContentHashParameters,
): SimpleTransactionRequest => {
  const prData = _getContentHash.encode(client, { name })
  return universalWrapper.encode(client, { name, data: prData.data })
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
): Promise<GetContentHashReturnType> => {
  const urData = await universalWrapper.decode(client, data)
  if (!urData) return null
  return _getContentHash.decode(client, urData.data)
}

type BatchableFunctionObject = GeneratedFunction<typeof encode, typeof decode>

/**
 * Gets the content hash record for a name
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetContentHashParameters}
 * @returns Content hash object, or `null` if not found. {@link GetContentHashReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addContracts, getContentHash } from '@ensdomains/ensjs'
 *
 * const mainnetWithEns = addContracts([mainnet])
 * const client = createPublicClient({
 *   chain: mainnetWithEns,
 *   transport: http(),
 * })
 * const result = await getContentHash(client, { name: 'ens.eth' })
 * // { protocolType: 'ipfs', decoded: 'k51qzi5uqu5djdczd6zw0grmo23j2vkj9uzvujencg15s5rlkq0ss4ivll8wqw' }
 */
const getContentHash = generateFunction({ encode, decode }) as ((
  client: ClientWithEns,
  { name }: GetContentHashParameters,
) => Promise<GetContentHashReturnType>) &
  BatchableFunctionObject

export default getContentHash
