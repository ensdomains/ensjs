import { userRegistrySetParentSnippet } from '@ensdomains/ensjs-abi/v2/userRegistry'
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
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../../utils/clientWithOverrides.js'

// ================================
// Write parameters
// ================================

export type SetParentWriteParametersParameters = {
  /** The registry whose canonical parent is being set */
  registryAddress: Address
  /** The parent registry that holds the registry's name */
  parentRegistryAddress: Address
  /** The registry's name's label in the parent registry */
  label: string
}

export type SetParentWriteParametersReturnType = ReturnType<
  typeof setParentWriteParameters
>

export const setParentWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    parentRegistryAddress,
    label,
  }: SetParentWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  return {
    address: registryAddress,
    abi: userRegistrySetParentSnippet,
    functionName: 'setParent',
    args: [parentRegistryAddress, label],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof userRegistrySetParentSnippet
  >
}

// ================================
// Action
// ================================

export type SetParentParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  SetParentWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type SetParentReturnType = Hash

export type SetParentErrorType =
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Sets a registry's canonical parent (`setParent`), which names the registry
 * when more than one name points at it. Requires `ROLE_SET_PARENT` on the
 * registry.
 * @param client - {@link Client}
 * @param parameters - {@link SetParentParameters}
 * @returns Transaction hash. {@link SetParentReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { setParent } from '@ensdomains/ensjs/wallet/v2'
 *
 * const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
 * const wallet = createWalletClient({
 *   account,
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setParent(wallet, {
 *   registryAddress: '0x...', // deployed subregistry
 *   parentRegistryAddress: '0x...', // registry holding the name
 *   label: 'myname',
 * })
 * // 0x...
 */
export async function setParent<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    parentRegistryAddress,
    label,
    ...txArgs
  }: SetParentParameters<chain, account, chainOverride>,
): Promise<SetParentReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = setParentWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      registryAddress,
      parentRegistryAddress,
      label,
    },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
