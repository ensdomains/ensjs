import { ethRenewerV1RenewSnippet } from '@ensdomains/ensjs-abi/v2/ethRenewerV1'
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

export type RenewNameV1WriteParametersParameters = {
  /** Full 2LD .eth name (e.g. example.eth) */
  name: string
  /** Renewal duration in seconds */
  duration: bigint | number
  /** ERC-20 token used for payment (must be approved for the renewer) */
  paymentToken: Address
  /**
   * Referrer id (bytes32). Defaults to zero bytes32 when omitted.
   */
  referrer?: Hex
}

export type RenewNameV1WriteParametersErrorType =
  | UnsupportedNameTypeError
  | GetChainContractAddressErrorType

export const renewNameV1WriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<chain, 'ensEthRenewerV1', account>,
  parameters: RenewNameV1WriteParametersParameters,
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
  }

  return {
    ...baseParams,
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensEthRenewerV1',
    }),
    abi: ethRenewerV1RenewSnippet,
    functionName: 'renew',
    args,
  } as const satisfies WriteContractParameters
}

export type RenewNameV1WriteParametersReturnType = ReturnType<
  typeof renewNameV1WriteParameters
>

// ================================
// Action
// ================================

export type RenewNameV1Parameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensEthRenewerV1'> | undefined,
> = Prettify<
  RenewNameV1WriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type RenewNameV1ReturnType = WriteContractReturnType

export type RenewNameV1ErrorType =
  | RenewNameV1WriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Renews an unmigrated legacy (ENSv1) .eth name via `ETHRenewerV1`, using ERC-20
 * payment (ENS Sepolia / extended chains with `ensEthRenewerV1`).
 *
 * Legacy `ETHRegistrarController`s were revoked at the v2 migration cutover, so a
 * v1 name that has not yet migrated cannot be renewed through them —
 * `ETHRenewerV1` renews it and syncs the underlying BaseRegistrar. It only
 * renews RESERVED (pre-migration) or in-grace names; an active, not-yet-migrated
 * v1 name reverts `NameNotRenewable` (gate with {@link isRenewable} first). Use
 * {@link renewName} for names registered on v2.
 *
 * @example
 * ```ts
 * import { renewNameV1 } from '@ensdomains/ensjs/wallet/v2'
 *
 * const hash = await renewNameV1(wallet, {
 *   name: 'example.eth',
 *   duration: 31536000n,
 *   paymentToken: usdcAddress,
 * })
 * ```
 */
export async function renewNameV1<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensEthRenewerV1'> | undefined,
>(
  client: RequireClientContracts<chain, 'ensEthRenewerV1', account>,
  {
    name,
    duration,
    paymentToken,
    referrer,
    ...txArgs
  }: RenewNameV1Parameters<chain, account, chainOverride>,
): Promise<RenewNameV1ReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = renewNameV1WriteParameters(
    clientWithOverrides(client, txArgs),
    { name, duration, paymentToken, referrer },
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
