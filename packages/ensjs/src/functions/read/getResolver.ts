import {
  Address,
  Hex,
  decodeFunctionResult,
  encodeFunctionData,
  toHex,
} from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { findResolverSnippet } from '../../contracts/universalResolver'
import { SimpleTransactionRequest } from '../../types'
import { EMPTY_ADDRESS } from '../../utils/consts'
import { generateFunction } from '../../utils/generateFunction'
import { packetToBytes } from '../../utils/hexEncodedName'

export type GetResolverParameters = {
  name: string
}

export type GetResolverReturnType = Address | null

const encode = (
  client: ClientWithEns,
  { name }: GetResolverParameters,
): SimpleTransactionRequest => {
  return {
    to: getChainContractAddress({ client, contract: 'ensUniversalResolver' }),
    data: encodeFunctionData({
      abi: findResolverSnippet,
      functionName: 'findResolver',
      args: [toHex(packetToBytes(name))],
    }),
  }
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
): Promise<GetResolverReturnType> => {
  const response = decodeFunctionResult({
    abi: findResolverSnippet,
    functionName: 'findResolver',
    data,
  })

  if (response[0] === EMPTY_ADDRESS) return null

  return response[0]
}

const getResolver = generateFunction({ encode, decode })

export default getResolver
