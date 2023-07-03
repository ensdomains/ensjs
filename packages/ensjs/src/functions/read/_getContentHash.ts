import { Hex, decodeFunctionResult, encodeFunctionData } from 'viem'
import { ClientWithEns } from '../../contracts/consts'
import { contenthashSnippet } from '../../contracts/publicResolver'
import { Prettify, SimpleTransactionRequest } from '../../types'
import { EMPTY_ADDRESS } from '../../utils/consts'
import { DecodedContentHash, decodeContenthash } from '../../utils/contentHash'
import { generateFunction } from '../../utils/generateFunction'
import { namehash } from '../../utils/normalise'

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
      abi: contenthashSnippet,
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
    abi: contenthashSnippet,
    functionName: 'contenthash',
    data,
  })

  return decodeContenthash(response)
}

const _getContentHash = generateFunction({ encode, decode })

export default _getContentHash
