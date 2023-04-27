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

const encode = async (client: ClientWithEns, address: string) => {
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

const decode = async (client: ClientWithEns, data: Hex, address: Address) => {
  const result = decodeFunctionResult({
    abi: reverseSnippet,
    functionName: 'reverse',
    data,
  })
  return {
    name: result[0],
    match: result[1].toLowerCase() === address.toLowerCase(),
    reverseResolverAddress: result[2],
    resolverAddress: result[3],
  }
}

const getName = generateFunction({ encode, decode })

export default getName
