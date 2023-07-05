import {
  Address,
  Hex,
  decodeFunctionResult,
  encodeFunctionData,
  labelhash,
  toBytes,
  toHex,
} from 'viem'
import { ClientWithEns } from '../../contracts/consts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { resolveSnippet } from '../../contracts/universalResolver'
import { SimpleTransactionRequest } from '../../types'
import { generateFunction } from '../../utils/generateFunction'
import { packetToBytes } from '../../utils/hexEncodedName'
import { encodeLabelhash } from '../../utils/labels'

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
      abi: resolveSnippet,
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
    abi: resolveSnippet,
    functionName: 'resolve',
    data,
  })
  return { data: result[0], resolver: result[1] }
}

const universalWrapper = generateFunction({ encode, decode })

export default universalWrapper
