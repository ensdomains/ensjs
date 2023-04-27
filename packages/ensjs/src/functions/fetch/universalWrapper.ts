import { Hex, decodeFunctionResult, encodeFunctionData, toHex } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { resolveSnippet } from '../../contracts/universalResolver'
import { generateFunction } from '../../utils/generateFunction'
import { packetToBytes } from '../../utils/hexEncodedName'

const encode = async (client: ClientWithEns, name: string, data: Hex) => {
  return {
    to: client.chain.contracts!.ensUniversalResolver!.address,
    data: encodeFunctionData({
      abi: resolveSnippet,
      functionName: 'resolve',
      args: [toHex(packetToBytes(name)), data],
    }),
  }
}

const decode = async (client: ClientWithEns, data: Hex) => {
  const result = decodeFunctionResult({
    abi: resolveSnippet,
    functionName: 'resolve',
    data,
  })
  return { data: result[0], resolver: result[1] }
}

const universalWrapper = generateFunction({ encode, decode })

export default universalWrapper
