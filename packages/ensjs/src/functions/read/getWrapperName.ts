import { Hex, decodeFunctionResult, encodeFunctionData, hexToBytes } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { namesSnippet } from '../../contracts/nameWrapper'
import { SimpleTransactionRequest } from '../../types'
import { generateFunction } from '../../utils/generateFunction'
import { bytesToPacket } from '../../utils/hexEncodedName'
import { namehash } from '../../utils/normalise'

export type GetWrapperNameParameters = {
  name: string
}

export type GetWrapperNameReturnType = string

const encode = (
  client: ClientWithEns,
  { name }: GetWrapperNameParameters,
): SimpleTransactionRequest => {
  return {
    to: getChainContractAddress({ client, contract: 'ensNameWrapper' }),
    data: encodeFunctionData({
      abi: namesSnippet,
      functionName: 'names',
      args: [namehash(name)],
    }),
  }
}

const decode = async (
  _client: ClientWithEns,
  data: Hex,
): Promise<GetWrapperNameReturnType | null> => {
  const result = decodeFunctionResult({
    abi: namesSnippet,
    functionName: 'names',
    data,
  })
  if (!result || result === '0x' || BigInt(result) === 0n) return null
  return bytesToPacket(hexToBytes(result))
}

const getWrapperName = generateFunction({ encode, decode })

export default getWrapperName
