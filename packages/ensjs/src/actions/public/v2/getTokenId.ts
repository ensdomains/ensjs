import { permissionedRegistryGetTokenIdSnippet } from '@ensdomains/ensjs-abi/v2/permissionedRegistry'
import { type Address, type Chain, labelhash } from 'viem'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { type GetChainContractAddressErrorType, getAction } from 'viem/utils'
import type { RequireClientContracts } from '../../../clients/shared.js'
import { getChainContractAddress } from '../../../clients/shared.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type GetTokenIdParameters = {
  /** Label to get the token ID for */
  label: string
  /** Optional custom registry address (defaults to chain's ensRegistry) */
  registryAddress?: Address
}

export type GetTokenIdReturnType = bigint

export type GetTokenIdErrorType =
  | GetChainContractAddressErrorType
  | ReadContractErrorType

/**
 * Gets the ERC1155 token ID for a name in a V2 registry.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetTokenIdParameters}
 * @returns The token ID as a bigint. {@link GetTokenIdReturnType}
 */
export async function getTokenId<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensRegistry'>,
  { label, registryAddress }: GetTokenIdParameters,
): Promise<GetTokenIdReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  const currentRegistry =
    registryAddress ??
    getChainContractAddress({
      chain: client.chain,
      contract: 'ensRegistry',
    })

  const labelHash = BigInt(labelhash(label))

  return readContractAction({
    address: currentRegistry,
    abi: permissionedRegistryGetTokenIdSnippet,
    functionName: 'getTokenId',
    args: [labelHash],
  })
}
