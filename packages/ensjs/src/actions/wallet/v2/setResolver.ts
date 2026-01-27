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
import { hexToBigInt } from 'viem'
import { writeContract } from 'viem/actions'
import { packetToBytes } from 'viem/ens'
import { getAction, toHex } from 'viem/utils'
import { permissionedRegistrySetResolverSnippet } from '../../../contracts/permissionedRegistry.js'
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

export type SetResolverWriteParametersParameters = {
  /** Name to set resolver for */
  name: string
  /** The v2 registry address */
  registryAddress: Address
  /** Resolver address to set */
  resolverAddress: Address
}

export type SetResolverWriteParametersReturnType = ReturnType<
  typeof setResolverWriteParameters
>

export const setResolverWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    name,
    registryAddress,
    resolverAddress,
  }: SetResolverWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const tokenId = hexToBigInt(toHex(packetToBytes(name)))

  return {
    address: registryAddress,
    abi: permissionedRegistrySetResolverSnippet,
    functionName: 'setResolver',
    args: [tokenId, resolverAddress],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof permissionedRegistrySetResolverSnippet
  >
}

// ================================
// Action
// ================================

export type SetResolverParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  SetResolverWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type SetResolverReturnType = Hash

export type SetResolverErrorType =
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Sets a resolver for a v2 name.
 * @param client - {@link Client}
 * @param parameters - {@link SetResolverParameters}
 * @returns Transaction hash. {@link SetResolverReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { setResolver } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setResolver(wallet, {
 *   name: 'myname.eth',
 *   registryAddress: '0x1234...', // v2 registry address
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
export async function setResolver<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    name,
    registryAddress,
    resolverAddress,
    ...txArgs
  }: SetResolverParameters<chain, account, chainOverride>,
): Promise<SetResolverReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = setResolverWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      name,
      registryAddress,
      resolverAddress,
    },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
