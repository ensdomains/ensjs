import type {
  Address,
  Chain,
  NamehashErrorType,
  ReadContractErrorType,
} from 'viem'
import { readContract } from 'viem/actions'
import { packetToBytes } from 'viem/ens'
import {
  type GetChainContractAddressErrorType,
  getAction,
  toHex,
} from 'viem/utils'
import {
  getChainContractAddress,
  type RequireClientContracts,
} from '../../../clients/chain.js'
import { universalResolverFindRegistriesSnippet } from '../../../contracts/universalResolver.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type GetNameRegistriesParameters = {
  name: string
  address?: Address
}

export type GetNameRegistriesReturnType = readonly Address[]

export type GetNameRegistriesErrorType =
  | GetChainContractAddressErrorType
  | ReadContractErrorType
  | NamehashErrorType

/**
 * Find all registries in the ancestry of `name`.
 * @param client - {@link Client}
 * @param parameters - {@link GetNameRegistriesParameters}
 * @returns Array of registry addresses. {@link GetNameRegistriesReturnType}
 */
export async function getNameRegistries<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensUniversalResolver'>,
  { name, address }: GetNameRegistriesParameters,
): Promise<GetNameRegistriesReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const contractAddress =
    address ??
    getChainContractAddress({
      chain: client.chain,
      contract: 'ensUniversalResolver',
    })

  const readContractAction = getAction(client, readContract, 'readContract')

  return readContractAction({
    address: contractAddress,
    abi: universalResolverFindRegistriesSnippet,
    functionName: 'findRegistries',
    args: [toHex(packetToBytes(name))],
  })
}
