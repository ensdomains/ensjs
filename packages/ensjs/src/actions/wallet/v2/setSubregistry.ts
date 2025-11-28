import type {
  Account,
  Address,
  Chain,
  Hash,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type { RequireClientContracts } from '../../../clients/chain.js'
import { userRegistrySetSubregistrySnippet } from '../../../contracts/userRegistry.js'
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../utils/clientWithOverrides.js'
import { labelToCanonicalId } from '../../../utils/v2/registry/labelToCanonicalId.js'

// ================================
// Write parameters
// ================================

export type SetSubregistryWriteParametersParameters = {
  /** The parent registry address */
  registryAddress: Address
  /** The label to set the subregistry for */
  label: string
  /** The subregistry address to assign */
  subregistryAddress: Address
}

export type SetSubregistryWriteParametersReturnType = ReturnType<
  typeof setSubregistryWriteParameters
>

export type SetSubregistryWriteParametersErrorType = never

export const setSubregistryWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<chain, never, account>,
  {
    registryAddress,
    label,
    subregistryAddress,
  }: SetSubregistryWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const tokenId = labelToCanonicalId(label)

  return {
    address: registryAddress,
    abi: userRegistrySetSubregistrySnippet,
    functionName: 'setSubregistry',
    args: [tokenId, subregistryAddress],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof userRegistrySetSubregistrySnippet
  >
}

// ================================
// Action
// ================================

export type SetSubregistryParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  SetSubregistryWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type SetSubregistryReturnType = Hash

export type SetSubregistryErrorType =
  | SetSubregistryWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Sets the subregistry for a name in the parent registry.
 * @param client - {@link Client}
 * @param parameters - {@link SetSubregistryParameters}
 * @returns Transaction hash. {@link SetSubregistryReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { setSubregistry } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setSubregistry(wallet, {
 *   registryAddress: '0x...', // parent registry
 *   label: 'myname',
 *   subregistryAddress: '0x...', // deployed subregistry
 * })
 * // 0x...
 */
export async function setSubregistry<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: RequireClientContracts<chain, never, account>,
  {
    registryAddress,
    label,
    subregistryAddress,
    ...txArgs
  }: SetSubregistryParameters<chain, account, chainOverride>,
): Promise<SetSubregistryReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = setSubregistryWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      registryAddress,
      label,
      subregistryAddress,
    },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
