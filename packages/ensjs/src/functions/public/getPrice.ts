import {
  type BaseError,
  type Hex,
  decodeFunctionResult,
  encodeFunctionData,
  namehash,
} from 'viem'
import { bulkRenewalRentPriceSnippet } from '../../contracts/bulkRenewal.js'
import type { ClientWithEns } from '../../contracts/consts.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { nameWrapperIsWrappedSnippet } from '../../contracts/nameWrapper.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import type { SimpleTransactionRequest } from '../../types.js'
import {
  type GeneratedFunction,
  generateFunction,
} from '../../utils/generateFunction.js'
import { getNameType } from '../../utils/getNameType.js'
import multicallWrapper from './multicallWrapper.js'

export type GetPriceParameters = {
  /** Name, or array of names, to get price for */
  nameOrNames: string | string[]
  /** Duration in seconds to get price for */
  duration: bigint | number
}

export type GetPriceReturnType = {
  /** Price base value */
  base: bigint
  /** Price premium */
  premium: bigint
  /** Whether any of the names are wrapped */
  containsWrappedNames: boolean
}

const encode = (
  client: ClientWithEns,
  { nameOrNames, duration }: GetPriceParameters,
): SimpleTransactionRequest => {
  const names = (Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames]).map(
    (name) => {
      const labels = name.split('.')
      const nameType = getNameType(name)
      if (nameType !== 'eth-2ld' && nameType !== 'tld')
        throw new UnsupportedNameTypeError({
          nameType,
          supportedNameTypes: ['eth-2ld', 'tld'],
          details: 'Currently only the price of eth-2ld names can be fetched',
        })
      return labels[0]
    },
  )

  const bulkRenewalAddress = getChainContractAddress({
    client,
    contract: 'ensBulkRenewal',
  })
  const nameWrapperAddress = getChainContractAddress({
    client,
    contract: 'ensNameWrapper',
  })
  return multicallWrapper.encode(client, {
    transactions: [
      {
        to: bulkRenewalAddress,
        data: encodeFunctionData({
          abi: bulkRenewalRentPriceSnippet,
          functionName: 'rentPrice',
          args: [names, BigInt(duration)],
        }),
      },
      {
        to: bulkRenewalAddress,
        data: encodeFunctionData({
          abi: bulkRenewalRentPriceSnippet,
          functionName: 'rentPrice',
          args: [names, 0n],
        }),
      },
      ...names.map((name) => ({
        to: nameWrapperAddress,
        data: encodeFunctionData({
          abi: nameWrapperIsWrappedSnippet,
          functionName: 'isWrapped',
          args: [namehash(name)],
        }),
      })),
    ],
  })
}

const decode = async (
  client: ClientWithEns,
  data: Hex | BaseError,
  _params: GetPriceParameters,
): Promise<GetPriceReturnType> => {
  if (typeof data === 'object') throw data
  const result = await multicallWrapper.decode(client, data, [])
  const price = decodeFunctionResult({
    abi: bulkRenewalRentPriceSnippet,
    functionName: 'rentPrice',
    data: result[0].returnData,
  })
  const premium = decodeFunctionResult({
    abi: bulkRenewalRentPriceSnippet,
    functionName: 'rentPrice',
    data: result[1].returnData,
  })
  const base = price - premium

  const containsWrappedNames = result.slice(2).some((r) =>
    decodeFunctionResult({
      abi: nameWrapperIsWrappedSnippet,
      functionName: 'isWrapped',
      data: r.returnData,
    }),
  )

  return {
    base,
    premium,
    containsWrappedNames,
  }
}

type BatchableFunctionObject = GeneratedFunction<typeof encode, typeof decode>

/**
 * Gets the price of a name, or array of names, for a given duration.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetPriceParameters}
 * @returns Price data object. {@link GetPriceReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getPrice } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getPrice(client, { nameOrNames: 'ens.eth', duration: 31536000 })
 * // { base: 352828971668930335n, premium: 0n }
 */
const getPrice = generateFunction({ encode, decode }) as ((
  client: ClientWithEns,
  { nameOrNames, duration }: GetPriceParameters,
) => Promise<GetPriceReturnType>) &
  BatchableFunctionObject

export default getPrice
