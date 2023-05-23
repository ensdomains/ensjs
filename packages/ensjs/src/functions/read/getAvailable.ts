import { Hex, decodeFunctionResult, encodeFunctionData, labelhash } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { availableSnippet } from '../../contracts/baseRegistrar'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { UnsupportedNameTypeError } from '../../errors/general'
import { SimpleTransactionRequest } from '../../types'
import { generateFunction } from '../../utils/generateFunction'
import { getNameType } from '../../utils/getNameType'

export type GetAvailableParameters = {
  name: string
}

export type GetAvailableReturnType = boolean

const encode = (
  client: ClientWithEns,
  { name }: GetAvailableParameters,
): SimpleTransactionRequest => {
  const labels = name.split('.')
  const nameType = getNameType(name)
  if (nameType !== 'eth-2ld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld'],
      details: 'Currently only eth-2ld names can be checked for availability',
    })

  return {
    to: getChainContractAddress({
      client,
      contract: 'ensBaseRegistrarImplementation',
    }),
    data: encodeFunctionData({
      abi: availableSnippet,
      functionName: 'available',
      args: [BigInt(labelhash(labels[0]))],
    }),
  }
}

const decode = async (
  _client: ClientWithEns,
  data: Hex,
): Promise<GetAvailableReturnType> => {
  const result = decodeFunctionResult({
    abi: availableSnippet,
    functionName: 'available',
    data,
  })
  return result
}

const getAvailable = generateFunction({ encode, decode })

export default getAvailable
