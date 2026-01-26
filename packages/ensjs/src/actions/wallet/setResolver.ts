import type {
  Account,
  Address,
  Chain,
  GetChainContractAddressErrorType,
  WriteContractErrorType,
  WriteContractParameters,
  WriteContractReturnType,
} from 'viem'
import { hexToBigInt, type NamehashErrorType, namehash } from 'viem'
import { writeContract } from 'viem/actions'
import { packetToBytes } from 'viem/ens'
import { getAction, toHex } from 'viem/utils'
import type {
  ChainWithL1Contracts,
  RequireClientL1Contracts,
} from '../../clients/l1.js'
import { getChainContractAddress } from '../../clients/shared.js'
import { nameWrapperSetResolverSnippet } from '../../contracts/nameWrapper.js'
import { permissionedRegistrySetResolverSnippet } from '../../contracts/permissionedRegistry.js'
import { registrySetResolverSnippet } from '../../contracts/registry.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Prettify, WriteTransactionParameters } from '../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../utils/clientWithOverrides.js'

export type SetResolverWriteParametersParameters = {
  /** Name to set resolver for */
  name: string
  /** Contract to set resolver on. Can be 'registry', 'nameWrapper', or a v2 registry address */
  contract: 'registry' | 'nameWrapper' | Address
  /** Resolver address to set */
  resolverAddress: Address
}

export type SetResolverWriteParametersReturnType = ReturnType<
  typeof setResolverWriteParameters
>

export type SetResolverWriteParametersErrorType =
  | ErrorType
  | GetChainContractAddressErrorType
  | NamehashErrorType

// ================================
// Write parameters
// ================================

export const setResolverWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientL1Contracts<
    chain,
    'ensNameWrapper' | 'ensRegistry',
    account
  >,
  { name, contract, resolverAddress }: SetResolverWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  // Handle v2 registry (contract is an address)
  if (contract !== 'registry' && contract !== 'nameWrapper') {
    const tokenId = hexToBigInt(toHex(packetToBytes(name)))
    return {
      address: contract,
      abi: permissionedRegistrySetResolverSnippet,
      functionName: 'setResolver',
      args: [tokenId, resolverAddress],
      chain: client.chain,
      account: client.account,
    } as const satisfies WriteContractParameters<
      typeof permissionedRegistrySetResolverSnippet
    >
  }

  const address = getChainContractAddress({
    chain: client.chain,
    contract: contract === 'nameWrapper' ? 'ensNameWrapper' : 'ensRegistry',
  })

  const args = [namehash(name), resolverAddress] as const
  const functionName = 'setResolver'

  const baseParams = {
    address,
    functionName,
    args,
    chain: client.chain,
    account: client.account,
  } as const

  if (contract === 'nameWrapper')
    return {
      ...baseParams,
      abi: nameWrapperSetResolverSnippet,
    } as const satisfies WriteContractParameters<
      typeof nameWrapperSetResolverSnippet
    >

  return {
    ...baseParams,
    abi: registrySetResolverSnippet,
  } as const satisfies WriteContractParameters<
    typeof registrySetResolverSnippet
  >
}

// ================================
// Action
// ================================

export type SetResolverParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithL1Contracts<'ensNameWrapper' | 'ensRegistry'>,
> = Prettify<
  SetResolverWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type SetResolverReturnType = WriteContractReturnType

export type SetResolverErrorType =
  | SetResolverWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Sets a resolver for a name.
 * @param client - {@link Client}
 * @param options - {@link SetResolverOptions}
 * @returns Transaction hash. {@link SetResolverReturnType}
 *
 * @example
 * // For v1 names (registry or nameWrapper)
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { setResolver } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setResolver(wallet, {
 *   name: 'ens.eth',
 *   contract: 'registry',
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 *
 * @example
 * // For v2 names (pass the registry address directly)
 * const hash = await setResolver(wallet, {
 *   name: 'myname.eth',
 *   contract: '0x1234...', // v2 registry address
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
export async function setResolver<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithL1Contracts<'ensNameWrapper' | 'ensRegistry'>,
>(
  client: RequireClientL1Contracts<
    chain,
    'ensNameWrapper' | 'ensRegistry',
    account
  >,
  {
    name,
    contract,
    resolverAddress,
    ...txArgs
  }: SetResolverParameters<chain, account, chainOverride>,
): Promise<SetResolverReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = setResolverWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      name,
      contract,
      resolverAddress,
    },
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
