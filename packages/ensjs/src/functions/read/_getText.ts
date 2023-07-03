import { Hex, decodeFunctionResult, encodeFunctionData } from 'viem'
import { ClientWithEns } from '../../contracts/consts'
import { textSnippet } from '../../contracts/publicResolver'
import { SimpleTransactionRequest } from '../../types'
import { EMPTY_ADDRESS } from '../../utils/consts'
import { generateFunction } from '../../utils/generateFunction'
import { namehash } from '../../utils/normalise'

export type InternalGetTextParameters = {
  /** Name to get text record for */
  name: string
  /** Text record key to get */
  key: string
}

export type InternalGetTextReturnType = string | null

const encode = (
  _client: ClientWithEns,
  { name, key }: InternalGetTextParameters,
): SimpleTransactionRequest => {
  return {
    to: EMPTY_ADDRESS,
    data: encodeFunctionData({
      abi: textSnippet,
      functionName: 'text',
      args: [namehash(name), key],
    }),
  }
}

const decode = async (
  _client: ClientWithEns,
  data: Hex,
): Promise<InternalGetTextReturnType> => {
  const response = decodeFunctionResult({
    abi: textSnippet,
    functionName: 'text',
    data,
  })

  if (!response) return null

  return response
}

const _getText = generateFunction({ encode, decode })

export default _getText
