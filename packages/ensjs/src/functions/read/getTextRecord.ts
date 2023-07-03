import { Hex } from 'viem'
import { ClientWithEns } from '../../contracts/consts'
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

export type GetTextRecordParameters = Prettify<InternalGetTextParameters>

export type GetTextRecordReturnType = Prettify<InternalGetTextReturnType>

const encode = (
  client: ClientWithEns,
  { name, key }: GetTextRecordParameters,
): SimpleTransactionRequest => {
  const prData = _getText.encode(client, { name, key })
  return universalWrapper.encode(client, { name, data: prData.data })
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
): Promise<GetTextRecordReturnType> => {
  const urData = await universalWrapper.decode(client, data)
  if (!urData) return null
  return _getText.decode(client, urData.data)
}

type BatchableFunctionObject = GeneratedFunction<typeof encode, typeof decode>

/**
 * Gets a text record for a name.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetTextRecordParameters}
 * @returns Text record string, or null if none is found. {@link GetTextRecordReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts, getTextRecord } from '@ensdomains/ensjs'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getTextRecord(client, { name: 'ens.eth', key: 'com.twitter' })
 * // ensdomains
 */
const getTextRecord = generateFunction({ encode, decode }) as ((
  client: ClientWithEns,
  { name, key }: GetTextRecordParameters,
) => Promise<GetTextRecordReturnType>) &
  BatchableFunctionObject

export default getTextRecord
