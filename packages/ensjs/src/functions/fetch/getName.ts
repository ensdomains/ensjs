import {
  Address,
  Hex,
  decodeFunctionResult,
  encodeFunctionData,
  toHex,
} from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { reverseSnippet } from '../../contracts/universalResolver'
import { generateFunction } from '../../utils/generateFunction'
import { packetToBytes } from '../../utils/hexEncodedName'

type GetNameArgs = {
  address: Address
}

type GetNameResult = {
  name: string
  match: boolean
  reverseResolverAddress: Address
  resolverAddress: Address
}

const encode = async (client: ClientWithEns, { address }: GetNameArgs) => {
  const reverseNode = `${address.toLowerCase().substring(2)}.addr.reverse`
  return {
    to: client.chain.contracts!.ensUniversalResolver!.address,
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
  { address }: GetNameArgs,
): Promise<GetNameResult | null> => {
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
