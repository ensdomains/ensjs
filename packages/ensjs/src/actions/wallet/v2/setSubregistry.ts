import { userRegistrySetSubregistrySnippet } from '@ensdomains/ensjs-abi/v2/userRegistry'
import type {
  Account,
  Address,
  Chain,
  Client,
  Hash,
  Transport,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { labelhash } from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../utils/clientWithOverrides.js'

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

export const setSubregistryWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    label,
    subregistryAddress,
  }: SetSubregistryWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const tokenId = BigInt(labelhash(label))

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
  client: Client<Transport, chain, account>,
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
