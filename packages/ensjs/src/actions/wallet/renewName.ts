import { ethRenewerV1RenewSnippet } from '@ensdomains/ensjs-abi/v1/ethRenewer'
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

// The two renewers share one `renew(label,duration,paymentToken,referrer)` ABI —
// only the target contract differs: `ensEthRegistrar` renews names registered on
// v2, `ensEthRenewerV1` renews unmigrated legacy (v1) names. The caller supplies
// which contract to use (from an indexer, or an on-chain owner lookup) — this
// action does no detection, it just builds the calldata.
type RenewerContract = 'ensEthRegistrar' | 'ensEthRenewerV1'

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
  /**
   * Renewer contract to use: `ensEthRegistrar` for names registered on v2,
   * `ensEthRenewerV1` for unmigrated legacy (v1) names.
   */
  contract: RenewerContract
}

export type RenewNameWriteParametersReturnType = ReturnType<
  typeof renewNameWriteParameters
>

export type RenewNameWriteParametersErrorType =
  | UnsupportedNameTypeError
  | GetChainContractAddressErrorType

// ================================
// Write parameters
// ================================

export const renewNameWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<chain, RenewerContract, account>,
  {
    name,
    duration,
    paymentToken,
    referrer = zeroHash,
    contract,
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

  if (contract !== 'ensEthRegistrar' && contract !== 'ensEthRenewerV1')
    throw new Error(`Unknown contract: ${contract}`)

  const [label] = name.split('.')

  const address = getChainContractAddress({
    chain: client.chain,
    contract,
  })

  const baseParams = {
    address,
    functionName: 'renew',
    args: [label, duration, paymentToken, referrer] as const,
    chain: client.chain,
    account: client.account,
  } as const

  if (contract === 'ensEthRenewerV1') {
    return {
      ...baseParams,
      abi: ethRenewerV1RenewSnippet,
    } as const satisfies WriteContractParameters<
      typeof ethRenewerV1RenewSnippet
    >
  }

  return {
    ...baseParams,
    abi: ethRegistrarRenewSnippet,
  } as const satisfies WriteContractParameters<typeof ethRegistrarRenewSnippet>
}

// ================================
// Renew name action
// ================================

export type RenewNameParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<RenewerContract> | undefined,
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
 * Renews a `.eth` 2LD via the given renewer contract: the v2 `ETHRegistrar`
 * (`contract: 'ensEthRegistrar'`) for names registered on v2, or `ETHRenewerV1`
 * (`contract: 'ensEthRenewerV1'`) for unmigrated legacy (v1) names. Both expose
 * the same `renew(label,duration,paymentToken,referrer)` ERC-20 interface, so
 * `contract` only selects the target address — resolve it from your data source
 * (indexer) or an on-chain owner lookup ({@link getOwner}).
 *
 * Legacy `ETHRegistrarController`s were revoked at the v2 migration cutover, so an
 * unmigrated v1 name can only be renewed through `ETHRenewerV1`, which renews it
 * and syncs the underlying v1 BaseRegistrar. It renews a name while it still holds
 * its pre-migration `RESERVED` slot (throughout the name's active life), or — once
 * that slot has lapsed to `AVAILABLE` — while it is still unclaimed and within the
 * v2 grace window; a name that was never reserved, has already migrated to v2, or
 * has lapsed past grace reverts `NameNotRenewable`.
 *
 * Renews a single name — neither renewer is `Multicallable`, so there is no
 * on-chain bulk-renewal path.
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
 *   contract: 'ensEthRegistrar',
 * })
 * // 0x...
 */
export async function renewName<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<RenewerContract> | undefined,
>(
  client: RequireClientContracts<chain, RenewerContract, account>,
  {
    name,
    duration,
    paymentToken,
    referrer,
    contract,
    ...txArgs
  }: RenewNameParameters<chain, account, chainOverride>,
): Promise<RenewNameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = renewNameWriteParameters(
    clientWithOverrides(client, txArgs),
    { name, duration, paymentToken, referrer, contract },
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
