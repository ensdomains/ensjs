import { ethRegistrarRenewSnippet } from '@ensdomains/ensjs-abi/v2/ethRegistrar'
import type {
  Account,
  Address,
  Chain,
  GetChainContractAddressErrorType,
  Hex,
  WriteContractErrorType,
  WriteContractParameters,
  WriteContractReturnType,
} from 'viem'
import { zeroHash } from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type {
  ChainWithContracts,
  RequireClientContracts,
} from '../../../clients/shared.js'
import { getChainContractAddress } from '../../../clients/shared.js'
import { UnsupportedNameTypeError } from '../../../errors/general.js'
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../utils/clientWithOverrides.js'
import { getNameType } from '../../../utils/name/getNameType.js'

// ================================
// Write parameters
// ================================

export type RenewNameWriteParametersParameters = {
  /** Full 2LD .eth name (e.g. example.eth) */
  name: string
  /** Renewal duration in seconds */
  duration: bigint | number
  /** ERC-20 token used for payment (must be approved for the registrar) */
  paymentToken: Address
  /**
   * Referrer id (bytes32). Defaults to zero bytes32 when omitted.
   */
  referrer?: Hex
}

export type RenewNameWriteParametersErrorType =
  | UnsupportedNameTypeError
  | GetChainContractAddressErrorType

export const renewNameWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<chain, 'ensEthRegistrar', account>,
  parameters: RenewNameWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const { name, duration, paymentToken, referrer = zeroHash } = parameters

  const nameType = getNameType(name)
  if (nameType !== 'eth-2ld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld'],
      details: 'Only 2ld-eth renewals are supported',
    })

  const [label] = name.split('.')

  const args = [label, BigInt(duration), paymentToken, referrer] as const

  const baseParams = {
    chain: client.chain,
    account: client.account,
    value: 0n,
  } as const

  return {
    ...baseParams,
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensEthRegistrar',
    }),
    abi: ethRegistrarRenewSnippet,
    functionName: 'renew',
    args,
  } as const satisfies WriteContractParameters
}

export type RenewNameWriteParametersReturnType = ReturnType<
  typeof renewNameWriteParameters
>

// ================================
// Action
// ================================

export type RenewNameParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensEthRegistrar'> | undefined,
> = Prettify<
  RenewNameWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type RenewNameReturnType = WriteContractReturnType

export type RenewNameErrorType =
  | RenewNameWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Renews a v2 ETHRegistrar name using ERC-20 payment (ENS Sepolia / extended chains with `ensEthRegistrar`).
 *
 * @example
 * ```ts
 * import { renewName } from '@ensdomains/ensjs/wallet/v2'
 *
 * const hash = await renewName(wallet, {
 *   name: 'example.eth',
 *   duration: 31536000n,
 *   paymentToken: usdcAddress,
 * })
 * ```
 */
export async function renewName<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensEthRegistrar'> | undefined,
>(
  client: RequireClientContracts<chain, 'ensEthRegistrar', account>,
  {
    name,
    duration,
    paymentToken,
    referrer,
    ...txArgs
  }: RenewNameParameters<chain, account, chainOverride>,
): Promise<RenewNameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = renewNameWriteParameters(
    clientWithOverrides(client, txArgs),
    { name, duration, paymentToken, referrer },
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
