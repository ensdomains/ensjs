import { ethRenewerV1RenewSnippet } from '@ensdomains/ensjs-abi/v1/ethRenewer'
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
} from '../../clients/shared.js'
import { getChainContractAddress } from '../../clients/shared.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import type { Prettify, WriteTransactionParameters } from '../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../utils/clientWithOverrides.js'
import { getNameType } from '../../utils/name/getNameType.js'

// ================================
// Write parameters
// ================================

export type RenewNameWriteParametersParameters = {
  /** Full 2LD .eth name to renew (e.g. example.eth) */
  name: string
  /** Renewal duration in seconds */
  duration: bigint
  /** ERC-20 token used for payment (must be approved for the renewer) */
  paymentToken: Address
  /**
   * Referrer id (bytes32). Defaults to zero bytes32 when omitted.
   */
  referrer?: Hex
}

export type RenewNameWriteParametersReturnType = ReturnType<
  typeof renewNameWriteParameters
>

export type RenewNameWriteParametersErrorType =
  | UnsupportedNameTypeError
  | GetChainContractAddressErrorType

export const renewNameWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<chain, 'ensEthRenewerV1', account>,
  {
    name,
    duration,
    paymentToken,
    referrer = zeroHash,
  }: RenewNameWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const nameType = getNameType(name)
  if (nameType !== 'eth-2ld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld'],
      details: 'Only 2ld-eth renewals are supported',
    })

  const [label] = name.split('.')

  return {
    chain: client.chain,
    account: client.account,
    value: 0n,
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensEthRenewerV1',
    }),
    abi: ethRenewerV1RenewSnippet,
    functionName: 'renew',
    args: [label, duration, paymentToken, referrer],
  } as const satisfies WriteContractParameters
}

// ================================
// Renew name action
// ================================

export type RenewNameParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensEthRenewerV1'> | undefined,
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
 * Renews an unmigrated legacy (ENSv1) .eth name via `ETHRenewerV1`, using ERC-20
 * payment (ENS Sepolia / extended chains with `ensEthRenewerV1`).
 *
 * Legacy `ETHRegistrarController`s were revoked at the v2 migration cutover, so a
 * v1 name that has not yet migrated cannot be renewed through them —
 * `ETHRenewerV1` renews it and syncs the underlying BaseRegistrar. It only
 * renews RESERVED (pre-migration) or in-grace names; an active, not-yet-migrated
 * v1 name reverts `NameNotRenewable` (gate with {@link isRenewable} first). Use
 * `renewName` from `@ensdomains/ensjs/wallet/v2` for names registered on v2.
 *
 * Renews a single name — `ETHRenewerV1.renew` has no batch entrypoint and the
 * contract is not `Multicallable`, so there is no on-chain bulk-renewal path.
 *
 * @param client - {@link Client}
 * @param options - {@link RenewNameParameters}
 * @returns Transaction hash. {@link RenewNameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { renewName } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 *
 * const hash = await renewName(wallet, {
 *   name: 'example.eth',
 *   duration: 31536000n, // 1 year
 *   paymentToken: usdcAddress,
 * })
 * // 0x...
 */
export async function renewName<
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
