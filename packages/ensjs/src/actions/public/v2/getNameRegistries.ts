import {
  type Address,
  type Chain,
  type NamehashErrorType,
  namehash,
  type ReadContractErrorType,
} from 'viem'
import { readContract } from 'viem/actions'
import { type GetChainContractAddressErrorType, getAction } from 'viem/utils'
import {
  getChainContractAddress,
  type RequireClientContracts,
} from '../../../clients/chain.js'
import { universalResolverFindRegistriesSnippet } from '../../../contracts/universalResolver.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type GetNameRegistriesParameters = {
  name: string
}

export type GetNameRegistriesReturnType = readonly Address[]

export type GetNameRegistriesErrorType =
  | GetChainContractAddressErrorType
  | ReadContractErrorType
  | NamehashErrorType

/**
 * Find all registries in the ancestry of `name`.
 * @param client
 */
export async function getNameRegistries<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensUniversalResolver'>,
  { name }: GetNameRegistriesParameters,
): Promise<GetNameRegistriesReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const universalResolverAddress = getChainContractAddress({
    chain: client.chain,
    contract: 'ensUniversalResolver',
  })

  const readContractAction = getAction(client, readContract, 'readContract')

  return readContractAction({
    address: universalResolverAddress,
    abi: universalResolverFindRegistriesSnippet,
    functionName: 'findRegistries',
    args: [namehash(name)],
  })
}
