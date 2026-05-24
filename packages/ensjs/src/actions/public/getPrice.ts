import { ethRegistrarControllerRentPriceSnippet } from '@ensdomains/ensjs-abi/v1/ethRegistrarController'
import type {
  Chain,
  GetChainContractAddressErrorType,
  MulticallErrorType,
  ReadContractErrorType,
} from 'viem'
import { multicall, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type { RequireClientContracts } from '../../clients/shared.js'
import { getChainContractAddress } from '../../clients/shared.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import { getNameType } from '../../utils/name/getNameType.js'

export type GetPriceParameters = {
  /** Name, or array of names, to get price for */
  nameOrNames: string | string[]
  /** Duration in seconds to get price for */
  duration: bigint | number
}

export type GetPriceReturnType = {
  /** Price base value (wei) */
  base: bigint
  /** Price premium (wei) */
  premium: bigint
}

export type GetPriceErrorType =
  | UnsupportedNameTypeError
  | GetChainContractAddressErrorType
  | ReadContractErrorType
  | MulticallErrorType
  | TypeError

const extractLabel = (name: string): string => {
  const nameType = getNameType(name)
  if (nameType !== 'eth-2ld' && nameType !== 'tld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld', 'tld'],
      details: 'Currently only the price of eth-2ld names can be fetched',
    })
  return name.split('.')[0]
}

/**
 * Gets the registration price of a name, or array of names, for a given duration.
 *
 * Calls `ETHRegistrarController.rentPrice(label, duration)` on the legacy v1 controller.
 * Pricing is ETH-native (no payment token), and `premium` reflects the post-expiry
 * exponential-decay premium curve on the legacy price oracle.
 *
 * When given an array of names, the reads are batched into a single Multicall3
 * round-trip and the returned `base`/`premium` are summed across all names (atomic
 * against one block).
 *
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
  client: RequireClientContracts<chain, 'ensEthRegistrarController'>,
  { nameOrNames, duration }: GetPriceParameters,
): Promise<GetPriceReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const controllerAddress = getChainContractAddress({
    chain: client.chain,
    contract: 'ensEthRegistrarController',
  })

  const durationBigInt = BigInt(duration)

  if (!Array.isArray(nameOrNames)) {
    const { base, premium } = await getAction(
      client,
      readContract,
      'readContract',
    )({
      address: controllerAddress,
      abi: ethRegistrarControllerRentPriceSnippet,
      functionName: 'rentPrice',
      args: [extractLabel(nameOrNames), durationBigInt],
    })
    return { base, premium }
  }

  const labels = nameOrNames.map(extractLabel)

  const results = await getAction(
    client,
    multicall,
    'multicall',
  )({
    allowFailure: false,
    contracts: labels.map(
      (label) =>
        ({
          address: controllerAddress,
          abi: ethRegistrarControllerRentPriceSnippet,
          functionName: 'rentPrice',
          args: [label, durationBigInt],
        }) as const,
    ),
  })

  let totalBase = 0n
  let totalPremium = 0n
  for (const { base, premium } of results) {
    totalBase += base
    totalPremium += premium
  }

  return { base: totalBase, premium: totalPremium }
}
