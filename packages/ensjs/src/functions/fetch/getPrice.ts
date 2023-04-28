import { Hex, decodeFunctionResult, encodeFunctionData } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { rentPriceSnippet as bulkRentPriceSnippet } from '../../contracts/bulkRenewal'
import { rentPriceSnippet as controllerRentPriceSnippet } from '../../contracts/ethRegistrarController'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { SimpleTransactionRequest } from '../../types'
import { generateFunction } from '../../utils/generateFunction'
import { checkIsDotEth } from '../../utils/validation'
import multicallWrapper from './multicallWrapper'

export type GetPriceParameters = {
  nameOrNames: string | string[]
  duration: number
}

export type GetPriceReturnType = {
  base: bigint
  premium: bigint
}

const encode = (
  client: ClientWithEns,
  { nameOrNames, duration }: GetPriceParameters,
): SimpleTransactionRequest => {
  const names = (Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames]).map(
    (name) => {
      const labels = name.split('.')
      if (labels.length !== 1 && !checkIsDotEth(labels)) {
        throw new Error('Only 2LD .eth names are supported for now')
      }
      return labels[0]
    },
  )

  if (names.length > 1) {
    const bulkRenewalAddress = getChainContractAddress({
      client,
      contract: 'ensBulkRenewal',
    })
    return multicallWrapper.encode(client, {
      transactions: [
        {
          to: bulkRenewalAddress,
          data: encodeFunctionData({
            abi: bulkRentPriceSnippet,
            functionName: 'rentPrice',
            args: [names, BigInt(duration)],
          }),
        },
        {
          to: bulkRenewalAddress,
          data: encodeFunctionData({
            abi: bulkRentPriceSnippet,
            functionName: 'rentPrice',
            args: [names, 0n],
          }),
        },
      ],
    })
  }
  return {
    to: getChainContractAddress({
      client,
      contract: 'ensEthRegistrarController',
    }),
    data: encodeFunctionData({
      abi: controllerRentPriceSnippet,
      functionName: 'rentPrice',
      args: [names[0], BigInt(duration)],
    }),
  }
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
  { nameOrNames }: GetPriceParameters,
): Promise<GetPriceReturnType> => {
  const isBulkRenewal = Array.isArray(nameOrNames) && nameOrNames.length > 1
  if (isBulkRenewal) {
    const result = await multicallWrapper.decode(client, data, [])
    const price = decodeFunctionResult({
      abi: bulkRentPriceSnippet,
      functionName: 'rentPrice',
      data: result[0].returnData,
    })
    const premium = decodeFunctionResult({
      abi: bulkRentPriceSnippet,
      functionName: 'rentPrice',
      data: result[1].returnData,
    })
    const base = price - premium
    return { base, premium }
  }

  return decodeFunctionResult({
    abi: controllerRentPriceSnippet,
    functionName: 'rentPrice',
    data,
  })
}

const getPrice = generateFunction({ encode, decode })

export default getPrice
