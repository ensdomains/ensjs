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
import { encodeFunctionData, zeroHash } from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type {
  ChainWithContracts,
  RequireClientContracts,
} from '../../../clients/shared.js'
import { getChainContractAddress } from '../../../clients/shared.js'
import { UnsupportedNameTypeError } from '../../../errors/general.js'
import type { Prettify, WriteTransactionParameters } from '../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../utils/clientWithOverrides.js'
import { getNameType } from '../../../utils/name/getNameType.js'

// ================================
// Write parameters
// ================================

export type RenewEthRegistrarNameArgs = {
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

const renewEthRegistrarNameArgs = ({
  name,
  duration,
  paymentToken,
  referrer = zeroHash,
}: RenewEthRegistrarNameArgs) => {
  const nameType = getNameType(name)
  if (nameType !== 'eth-2ld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld'],
      details: 'Only 2ld-eth renewals are supported',
    })

  const [label] = name.split('.')

  return [label, BigInt(duration), paymentToken, referrer] as const
}

/**
 * ABI-encoded calldata for {@link ethRegistrarRenewSnippet} `renew`.
 */
export function encodeRenewEthRegistrarNameData(
  parameters: RenewEthRegistrarNameArgs,
): Hex {
  const args = renewEthRegistrarNameArgs(parameters)
  return encodeFunctionData({
    abi: ethRegistrarRenewSnippet,
    functionName: 'renew',
    args,
  })
}

export type RenewEthRegistrarNameWriteParametersParameters =
  RenewEthRegistrarNameArgs

export type RenewEthRegistrarNameWriteParametersReturnType = ReturnType<
  typeof renewEthRegistrarNameWriteParameters
>

export type RenewEthRegistrarNameWriteParametersErrorType =
  | UnsupportedNameTypeError
  | GetChainContractAddressErrorType

export const renewEthRegistrarNameWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<chain, 'ensEthRegistrar', account>,
  parameters: RenewEthRegistrarNameWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const args = renewEthRegistrarNameArgs(parameters)

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

// ================================
// Action
// ================================

export type RenewEthRegistrarNameParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends
    | ChainWithContracts<'ensEthRegistrar'>
    | undefined,
> = Prettify<
  RenewEthRegistrarNameWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type RenewEthRegistrarNameReturnType = WriteContractReturnType

export type RenewEthRegistrarNameErrorType =
  | RenewEthRegistrarNameWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Renews a v2 ETHRegistrar name using ERC-20 payment (ENS Sepolia / extended chains with `ensEthRegistrar`).
 *
 * @example
 * ```ts
 * import { renewEthRegistrarName } from '@ensdomains/ensjs/wallet/v2'
 *
 * const hash = await renewEthRegistrarName(wallet, {
 *   name: 'example.eth',
 *   duration: 31536000n,
 *   paymentToken: usdcAddress,
 * })
 * ```
 */
export async function renewEthRegistrarName<
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
  }: RenewEthRegistrarNameParameters<chain, account, chainOverride>,
): Promise<RenewEthRegistrarNameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = renewEthRegistrarNameWriteParameters(
    clientWithOverrides(client, txArgs),
    { name, duration, paymentToken, referrer },
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
