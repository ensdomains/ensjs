import { decodeFunctionResult, encodeFunctionData, type Hex } from 'viem'
import type { ClientWithEns } from '../../contracts/consts.js'
import { publicResolverContenthashSnippet } from '../../contracts/publicResolver.js'
import type { Prettify, SimpleTransactionRequest } from '../../types.js'
import { EMPTY_ADDRESS } from '../../utils/consts.js'
import {
  decodeContenthash,
  type DecodedContentHash,
} from '../../utils/contentHash.js'
import { generateFunction } from '../../utils/generateFunction.js'
import { namehash } from '../../utils/normalise.js'

export type InternalGetContentHashParameters = {
  /** Name to get content hash record for */
  name: string
}

export type InternalGetContentHashReturnType =
  Prettify<DecodedContentHash | null>

const encode = (
  _client: ClientWithEns,
  { name }: InternalGetContentHashParameters,
): SimpleTransactionRequest => {
  return {
    to: EMPTY_ADDRESS,
    data: encodeFunctionData({
      abi: publicResolverContenthashSnippet,
      functionName: 'contenthash',
      args: [namehash(name)],
    }),
  }
}

const decode = async (
  _client: ClientWithEns,
  data: Hex,
): Promise<InternalGetContentHashReturnType> => {
  const response = decodeFunctionResult({
    abi: publicResolverContenthashSnippet,
    functionName: 'contenthash',
    data,
  })

  return decodeContenthash(response)
}

const _getContentHash = generateFunction({ encode, decode })

export default _getContentHash
