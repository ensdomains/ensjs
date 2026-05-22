import { ethRegistrarGetRegisterPriceSnippet } from '@ensdomains/ensjs-abi/v2/ethRegistrar'
import type { Address, Client, ReadContractErrorType } from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { UnsupportedNameTypeError } from '../../../errors/general.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { getNameType } from '../../../utils/name/getNameType.js'

export type GetPriceParameters = {
  /** Address of the L2 ETH registrar contract */
  registrarAddress: Address
  /** Name, or array of names, to get price for */
  nameOrNames: string | string[]
  /** Duration in seconds to get price for */
  duration: bigint
  /** Payment token address */
  paymentToken: Address
}

export type GetPriceReturnType = {
  /** Price base value */
  base: bigint
  /** Price premium */
  premium: bigint
}

export type GetPriceErrorType =
  | UnsupportedNameTypeError
  | ReadContractErrorType
  | TypeError

/**
 * Gets the registration price of a name, or array of names, for a given duration.
 *
 * Internally calls `ETHRegistrar.getRegisterPrice(label, duration, paymentToken)`. The
 * registrar derives the `available` period (time elapsed since `expiry + GRACE_PERIOD`)
 * from on-chain state and passes it to the rent price oracle; this means the returned
 * `premium` already reflects the post-expiry exponential-decay premium curve.
 *
 * @param client - {@link Client}
 * @param parameters - {@link GetPriceParameters}
 * @returns Price data object. {@link GetPriceReturnType}
 */
export async function getPrice(
  client: Client,
  { registrarAddress, nameOrNames, duration, paymentToken }: GetPriceParameters,
): Promise<GetPriceReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const names = Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames]

  let totalBase = 0n
  let totalPremium = 0n

  const readContractAction = getAction(client, readContract, 'readContract')

  for (const name of names) {
    const labels = name.split('.')
    const nameType = getNameType(name)

    if (nameType !== 'eth-2ld' && nameType !== 'tld') {
      throw new UnsupportedNameTypeError({
        nameType,
        supportedNameTypes: ['eth-2ld', 'tld'],
        details: 'Currently only the price of eth-2ld names can be fetched',
      })
    }

    const [base, premium] = await readContractAction({
      address: registrarAddress,
      abi: ethRegistrarGetRegisterPriceSnippet,
      functionName: 'getRegisterPrice',
      args: [labels[0], duration, paymentToken],
    })

    totalBase += base
    totalPremium += premium
  }

  return {
    base: totalBase,
    premium: totalPremium,
  }
}
