import {
  Address,
  Hex,
  decodeFunctionResult,
  encodeFunctionData,
  toHex,
} from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { resolveSnippet } from '../../contracts/universalResolver'
import { SimpleTransactionRequest } from '../../types'
import { generateFunction } from '../../utils/generateFunction'
import { packetToBytes } from '../../utils/hexEncodedName'

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
  return {
    to: getChainContractAddress({ client, contract: 'ensUniversalResolver' }),
    data: encodeFunctionData({
      abi: resolveSnippet,
      functionName: 'resolve',
      args: [toHex(packetToBytes(name)), data],
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
