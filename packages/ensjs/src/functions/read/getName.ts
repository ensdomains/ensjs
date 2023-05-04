import {
  Address,
  Hex,
  decodeFunctionResult,
  encodeFunctionData,
  toHex,
} from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { reverseSnippet } from '../../contracts/universalResolver'
import { SimpleTransactionRequest } from '../../types'
import { generateFunction } from '../../utils/generateFunction'
import { packetToBytes } from '../../utils/hexEncodedName'

export type GetNameParameters = {
  address: Address
}

export type GetNameReturnType = {
  name: string
  match: boolean
  reverseResolverAddress: Address
  resolverAddress: Address
}

const encode = (
  client: ClientWithEns,
  { address }: GetNameParameters,
): SimpleTransactionRequest => {
  const reverseNode = `${address.toLowerCase().substring(2)}.addr.reverse`
  return {
    to: getChainContractAddress({ client, contract: 'ensUniversalResolver' }),
    data: encodeFunctionData({
      abi: reverseSnippet,
      functionName: 'reverse',
      args: [toHex(packetToBytes(reverseNode))],
    }),
  }
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
  { address }: GetNameParameters,
): Promise<GetNameReturnType | null> => {
  const result = decodeFunctionResult({
    abi: reverseSnippet,
    functionName: 'reverse',
    data,
  })
  if (!result[0]) return null
  return {
    name: result[0],
    match: result[1].toLowerCase() === address.toLowerCase(),
    reverseResolverAddress: result[2],
    resolverAddress: result[3],
  }
}

const getName = generateFunction({ encode, decode })

export default getName
