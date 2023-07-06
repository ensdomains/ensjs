import {
  decodeFunctionResult,
  encodeFunctionData,
  labelhash,
  toBytes,
  toHex,
  type Address,
  type Hex,
} from 'viem'
import type { ClientWithEns } from '../../contracts/consts.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { universalResolverResolveSnippet } from '../../contracts/universalResolver.js'
import type { SimpleTransactionRequest } from '../../types.js'
import { generateFunction } from '../../utils/generateFunction.js'
import { packetToBytes } from '../../utils/hexEncodedName.js'
import { encodeLabelhash } from '../../utils/labels.js'

export type UniversalWrapperParameters = {
  name: string
  data: Hex
}

export type UniversalWrapperReturnType = {
  data: Hex
  resolver: Address
}

const encode = (
  client: ClientWithEns,
  { name, data }: UniversalWrapperParameters,
): SimpleTransactionRequest => {
  const nameWithSizedLabels = name
    .split('.')
    .map((label) => {
      const labelLength = toBytes(label).byteLength
      if (labelLength > 255) {
        return encodeLabelhash(labelhash(label))
      }
      return label
    })
    .join('.')
  return {
    to: getChainContractAddress({ client, contract: 'ensUniversalResolver' }),
    data: encodeFunctionData({
      abi: universalResolverResolveSnippet,
      functionName: 'resolve',
      args: [toHex(packetToBytes(nameWithSizedLabels)), data],
    }),
  }
}

const decode = async (
  _client: ClientWithEns,
  data: Hex,
): Promise<UniversalWrapperReturnType> => {
  const result = decodeFunctionResult({
    abi: universalResolverResolveSnippet,
    functionName: 'resolve',
    data,
  })
  return { data: result[0], resolver: result[1] }
}

const universalWrapper = generateFunction({ encode, decode })

export default universalWrapper
