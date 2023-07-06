import { decodeFunctionResult, encodeFunctionData, type Hex } from 'viem'
import type { ClientWithEns } from '../../contracts/consts.js'
import { publicResolverTextSnippet } from '../../contracts/publicResolver.js'
import type { SimpleTransactionRequest } from '../../types.js'
import { EMPTY_ADDRESS } from '../../utils/consts.js'
import { generateFunction } from '../../utils/generateFunction.js'
import { namehash } from '../../utils/normalise.js'

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
      abi: publicResolverTextSnippet,
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
    abi: publicResolverTextSnippet,
    functionName: 'text',
    data,
  })

  if (!response) return null

  return response
}

const _getText = generateFunction({ encode, decode })

export default _getText
