import {
  type Chain,
  type Client,
  type GetChainContractAddressErrorType,
  type MulticallErrorType,
  type ReadContractErrorType,
} from 'viem'
import { multicall, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'

import { bulkRenewalRentPriceSnippet } from '../../contracts/bulkRenewal.js'
import { ethRegistrarControllerRentPriceSnippet } from '../../contracts/ethRegistrarController.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import { getNameType } from '../../utils/name/getNameType.js'
import {
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'

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
}

export type GetPriceErrorType =
  | UnsupportedNameTypeError
  | MulticallErrorType
  | GetChainContractAddressErrorType
  | ReadContractErrorType
  | TypeError

/**
 * Gets the price of a name, or array of names, for a given duration.
 * @param client - {@link Client}
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
export async function getPrice<chain extends Chain>(
  client: RequireClientContracts<
    chain,
    'ensEthRegistrarController' | 'ensBulkRenewal'
  >,
  { nameOrNames, duration }: GetPriceParameters,
): Promise<GetPriceReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

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

  if (names.length > 1) {
    const multicallAction = getAction(client, multicall, 'multicall')
    const [price, premium] = await multicallAction({
      contracts: [
        {
          address: getChainContractAddress({
            chain: client.chain,
            contract: 'ensBulkRenewal',
          }),
          abi: bulkRenewalRentPriceSnippet,
          functionName: 'rentPrice',
          args: [names, BigInt(duration)],
        },
        {
          address: getChainContractAddress({
            chain: client.chain,
            contract: 'ensBulkRenewal',
          }),
          abi: bulkRenewalRentPriceSnippet,
          functionName: 'rentPrice',
          args: [names, 0n],
        },
      ],
      allowFailure: false,
    })
    const base = price - premium
    return { base, premium }
  }

  const readContractAction = getAction(client, readContract, 'readContract')
  return readContractAction({
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensEthRegistrarController',
    }),
    abi: ethRegistrarControllerRentPriceSnippet,
    functionName: 'rentPrice',
    args: [names[0], BigInt(duration)],
  })
}
