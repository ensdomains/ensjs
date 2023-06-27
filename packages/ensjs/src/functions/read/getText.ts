import { Hex } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { Prettify, SimpleTransactionRequest } from '../../types'
import {
  GeneratedFunction,
  generateFunction,
} from '../../utils/generateFunction'
import _getText, {
  InternalGetTextParameters,
  InternalGetTextReturnType,
} from './_getText'
import universalWrapper from './universalWrapper'

export type GetTextParameters = Prettify<InternalGetTextParameters>

export type GetTextReturnType = Prettify<InternalGetTextReturnType>

const encode = (
  client: ClientWithEns,
  { name, key }: GetTextParameters,
): SimpleTransactionRequest => {
  const prData = _getText.encode(client, { name, key })
  return universalWrapper.encode(client, { name, data: prData.data })
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
): Promise<GetTextReturnType> => {
  const urData = await universalWrapper.decode(client, data)
  if (!urData) return null
  return _getText.decode(client, urData.data)
}

type BatchableFunctionObject = GeneratedFunction<typeof encode, typeof decode>

/**
 * Gets a text record for a name.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetTextParameters}
 * @returns Text record string, or null if none is found. {@link GetTextReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addContracts, getText } from '@ensdomains/ensjs'
 *
 * const mainnetWithEns = addContracts([mainnet])
 * const client = createPublicClient({
 *   chain: mainnetWithEns,
 *   transport: http(),
 * })
 * const result = await getText(client, { name: 'ens.eth', key: 'com.twitter' })
 * // ensdomains
 */
const getText = generateFunction({ encode, decode }) as ((
  client: ClientWithEns,
  { name, key }: GetTextParameters,
) => Promise<GetTextReturnType>) &
  BatchableFunctionObject

export default getText
