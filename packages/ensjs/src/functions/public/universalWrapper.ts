import {
  BaseError,
  decodeErrorResult,
  decodeFunctionResult,
  encodeFunctionData,
  getContractError,
  labelhash,
  toBytes,
  toHex,
  type Address,
  type Hex,
} from 'viem'
import type { ClientWithEns } from '../../contracts/consts.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { universalResolverResolveSnippet } from '../../contracts/universalResolver.js'
import type {
  GenericPassthrough,
  TransactionRequestWithPassthrough,
} from '../../types.js'
import { EMPTY_ADDRESS } from '../../utils/consts.js'
import { generateFunction } from '../../utils/generateFunction.js'
import { getRevertErrorData } from '../../utils/getRevertErrorData.js'
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
): TransactionRequestWithPassthrough => {
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
  const to = getChainContractAddress({
    client,
    contract: 'ensUniversalResolver',
  })
  const args = [toHex(packetToBytes(nameWithSizedLabels)), data] as const
  return {
    to: getChainContractAddress({ client, contract: 'ensUniversalResolver' }),
    data: encodeFunctionData({
      abi: universalResolverResolveSnippet,
      functionName: 'resolve',
      args,
    }),
    passthrough: {
      args,
      address: to,
    },
  }
}

const decode = async (
  _client: ClientWithEns,
  data: Hex | BaseError,
  passthrough: GenericPassthrough,
): Promise<UniversalWrapperReturnType> => {
  if (typeof data === 'object') {
    const errorData = getRevertErrorData(data)
    if (errorData) {
      const decodedError = decodeErrorResult({
        abi: universalResolverResolveSnippet,
        data: errorData,
      })
      if (
        decodedError.errorName === 'ResolverNotFound' ||
        decodedError.errorName === 'ResolverWildcardNotSupported'
      )
        return {
          data: '0x',
          resolver: EMPTY_ADDRESS,
        }
    }
    throw getContractError(data, {
      abi: universalResolverResolveSnippet,
      functionName: 'resolve',
      args: passthrough.args,
      address: passthrough.address,
    })
  }

  const result = decodeFunctionResult({
    abi: universalResolverResolveSnippet,
    functionName: 'resolve',
    data,
  })
  return { data: result[0], resolver: result[1] }
}

const universalWrapper = generateFunction({ encode, decode })

export default universalWrapper
