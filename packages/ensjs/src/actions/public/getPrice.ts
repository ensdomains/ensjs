import type {
  Address,
  Chain,
  GetChainContractAddressErrorType,
  ReadContractErrorType,
} from 'viem'
import { readContract } from 'viem/actions'
import { zeroAddress } from 'viem'
import { getAction } from 'viem/utils'
import type { RequireClientL2Contracts } from '../../clients/l2.js'
import { getChainContractAddress } from '../../clients/shared.js'
import { l2EthRegistrarRentPriceSnippet } from '../../contracts/l2EthRegistrar.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import { getNameType } from '../../utils/name/getNameType.js'

export type GetPriceParameters = {
  /** Name, or array of names, to get price for */
  nameOrNames: string | string[]
  /** Duration in seconds to get price for */
  duration: bigint | number
  /** Owner address (defaults to zero address) */
  owner?: Address
  /** Payment token address (defaults to USDC from chain config) */
  paymentToken?: Address
}

export type GetPriceReturnType = {
  /** Price base value */
  base: bigint
  /** Price premium */
  premium: bigint
}

export type GetPriceErrorType =
  | UnsupportedNameTypeError
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
  client: RequireClientL2Contracts<chain, 'ethRegistrar' | 'usdc'>,
  {
    nameOrNames,
    duration,
    owner = zeroAddress,
    paymentToken,
  }: GetPriceParameters,
): Promise<GetPriceReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  // Default to USDC from chain config if no payment token specified
  const resolvedPaymentToken =
    paymentToken ??
    getChainContractAddress({
      chain: client.chain,
      contract: 'usdc',
    })

  const names = Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames]

  let totalBase = 0n
  let totalPremium = 0n

  const readContractAction = getAction(client, readContract, 'readContract')

  // Process each name individually and aggregate the results
  // TODO: not sure if this is the best way to do this, ask Jakob
  for (const name of names) {
    const labels = name.split('.')
    const nameType = getNameType(name)

    if (nameType !== 'eth-2ld' && nameType !== 'tld')
      throw new UnsupportedNameTypeError({
        nameType,
        supportedNameTypes: ['eth-2ld', 'tld'],
        details: 'Currently only the price of eth-2ld names can be fetched',
      })

    const [base, premium] = await readContractAction({
      address: getChainContractAddress({
        chain: client.chain,
        contract: 'ethRegistrar',
      }),
      abi: l2EthRegistrarRentPriceSnippet,
      functionName: 'rentPrice',
      args: [labels[0], owner, BigInt(duration), resolvedPaymentToken],
    })

    totalBase += base
    totalPremium += premium
  }

  return {
    base: totalBase,
    premium: totalPremium,
  }
}
