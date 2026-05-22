import { standardRentPriceOracleIsPaymentTokenSnippet } from '@ensdomains/ensjs-abi/v2/standardRentPriceOracle'
import type { Address, Client, ReadContractErrorType } from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type IsPaymentTokenParameters = {
  /** Address of the StandardRentPriceOracle contract */
  oracleAddress: Address
  /** ERC-20 token address to check */
  paymentToken: Address
}

export type IsPaymentTokenReturnType = boolean

export type IsPaymentTokenErrorType = ReadContractErrorType

/**
 * Checks whether a token is accepted for register/renew payment.
 * payment-token validation lives on the StandardRentPriceOracle (the registrar
 * delegates pricing/payment to a swappable oracle).
 *
 * @param client - {@link Client}
 * @param parameters - {@link IsPaymentTokenParameters}
 * @returns `true` if the token is supported. {@link IsPaymentTokenReturnType}
 */
export async function isPaymentToken(
  client: Client,
  { oracleAddress, paymentToken }: IsPaymentTokenParameters,
): Promise<IsPaymentTokenReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  return readContractAction({
    address: oracleAddress,
    abi: standardRentPriceOracleIsPaymentTokenSnippet,
    functionName: 'isPaymentToken',
    args: [paymentToken],
  })
}
