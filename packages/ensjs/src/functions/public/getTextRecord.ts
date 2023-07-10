import type { BaseError, Hex } from 'viem'
import type { ClientWithEns } from '../../contracts/consts.js'
import type {
  GenericPassthrough,
  Prettify,
  SimpleTransactionRequest,
} from '../../types.js'
import {
  generateFunction,
  type GeneratedFunction,
} from '../../utils/generateFunction.js'
import _getText, {
  type InternalGetTextParameters,
  type InternalGetTextReturnType,
} from './_getText.js'
import universalWrapper from './universalWrapper.js'

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
  data: Hex | BaseError,
  passthrough: GenericPassthrough,
): Promise<GetTextRecordReturnType> => {
  const urData = await universalWrapper.decode(client, data, passthrough)
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
