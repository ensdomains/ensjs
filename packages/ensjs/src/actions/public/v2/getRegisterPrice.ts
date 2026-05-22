import { ethRegistrarGetRegisterPriceSnippet } from '@ensdomains/ensjs-abi/v2/ethRegistrar'
import type { Address, Client, ReadContractErrorType } from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { UnsupportedNameTypeError } from '../../../errors/general.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { getNameType } from '../../../utils/name/getNameType.js'

export type GetRegisterPriceParameters = {
  /** Address of the v2 ETHRegistrar contract */
  registrarAddress: Address
  /** Name to price (eth-2ld, e.g. example.eth) */
  name: string
  /** Registration duration in seconds */
  duration: bigint | number
  /** ERC-20 payment token address */
  paymentToken: Address
}

export type GetRegisterPriceReturnType = {
  /** Base price in `paymentToken` units */
  base: bigint
  /** Expiry premium in `paymentToken` units (0 unless recently expired) */
  premium: bigint
}

export type GetRegisterPriceErrorType =
  | UnsupportedNameTypeError
  | ReadContractErrorType
  | TypeError

/**
 * Gets the state-aware registration price for a v2 name (post-audit
 * ETHRegistrar, which delegates to its `IRentPriceOracle`). Reverts on-chain if
 * the name isn't registerable.
 *
 * @param client - {@link Client}
 * @param parameters - {@link GetRegisterPriceParameters}
 * @returns Base + premium price. {@link GetRegisterPriceReturnType}
 *
 * @example
 * import { getRegisterPrice } from '@ensdomains/ensjs/public/v2'
 *
 * const { base, premium } = await getRegisterPrice(client, {
 *   registrarAddress: '0x...',
 *   name: 'example.eth',
 *   duration: 31536000n,
 *   paymentToken: usdcAddress,
 * })
 */
export async function getRegisterPrice(
  client: Client,
  {
    registrarAddress,
    name,
    duration,
    paymentToken,
  }: GetRegisterPriceParameters,
): Promise<GetRegisterPriceReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const nameType = getNameType(name)
  if (nameType !== 'eth-2ld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld'],
      details: 'Only 2ld-eth registration prices can be fetched',
    })

  const [label] = name.split('.')

  const readContractAction = getAction(client, readContract, 'readContract')

  const [base, premium] = await readContractAction({
    address: registrarAddress,
    abi: ethRegistrarGetRegisterPriceSnippet,
    functionName: 'getRegisterPrice',
    args: [label, BigInt(duration), paymentToken],
  })

  return { base, premium }
}
