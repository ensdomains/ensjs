import { ethRegistrarGetRenewPriceSnippet } from '@ensdomains/ensjs-abi/v2/ethRegistrar'
import type { Address, Client, ReadContractErrorType } from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { UnsupportedNameTypeError } from '../../../errors/general.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { getNameType } from '../../../utils/name/getNameType.js'

export type GetRenewPriceParameters = {
  /** Address of the v2 ETHRegistrar contract */
  registrarAddress: Address
  /** Name to price (eth-2ld, e.g. example.eth) */
  name: string
  /** Renewal duration in seconds */
  duration: bigint | number
  /** ERC-20 payment token address */
  paymentToken: Address
}

export type GetRenewPriceReturnType = bigint

export type GetRenewPriceErrorType =
  | UnsupportedNameTypeError
  | ReadContractErrorType
  | TypeError

/**
 * Gets the state-aware renewal price for a v2 name (post-audit ETHRegistrar,
 * which delegates to its `IRentPriceOracle`). Renewals are premium-exempt, so a
 * single amount is returned. Reverts on-chain (`NameNotRenewable`) if the name
 * isn't currently registered/renewable.
 *
 * @param client - {@link Client}
 * @param parameters - {@link GetRenewPriceParameters}
 * @returns Renewal price in `paymentToken` units. {@link GetRenewPriceReturnType}
 *
 * @example
 * import { getRenewPrice } from '@ensdomains/ensjs/public/v2'
 *
 * const price = await getRenewPrice(client, {
 *   registrarAddress: '0x...',
 *   name: 'example.eth',
 *   duration: 31536000n,
 *   paymentToken: usdcAddress,
 * })
 */
export async function getRenewPrice(
  client: Client,
  { registrarAddress, name, duration, paymentToken }: GetRenewPriceParameters,
): Promise<GetRenewPriceReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const nameType = getNameType(name)
  if (nameType !== 'eth-2ld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld'],
      details: 'Only 2ld-eth renewal prices can be fetched',
    })

  const [label] = name.split('.')

  const readContractAction = getAction(client, readContract, 'readContract')

  return readContractAction({
    address: registrarAddress,
    abi: ethRegistrarGetRenewPriceSnippet,
    functionName: 'getRenewPrice',
    args: [label, BigInt(duration), paymentToken],
  })
}
