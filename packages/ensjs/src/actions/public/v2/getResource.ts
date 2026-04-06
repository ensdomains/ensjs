import type { Address, Chain } from 'viem'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { type GetChainContractAddressErrorType, getAction } from 'viem/utils'
import type { RequireClientContracts } from '../../../clients/shared.js'
import { getChainContractAddress } from '../../../clients/shared.js'
import { permissionedRegistryGetResourceSnippet } from '../../../contracts/permissionedRegistry.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { labelToCanonicalId } from '../../../utils/v2/registry/labelToCanonicalId.js'

export type GetResourceParameters = {
  /** Label to get the EAC resource ID for */
  label: string
  /** Optional custom registry address (defaults to chain's ensRegistry) */
  registryAddress?: Address
}

export type GetResourceReturnType = bigint

export type GetResourceErrorType =
  | GetChainContractAddressErrorType
  | ReadContractErrorType

/**
 * Gets the EAC resource ID for a name in a V2 registry.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetResourceParameters}
 * @returns The resource ID as a bigint. {@link GetResourceReturnType}
 */
export async function getResource<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensRegistry'>,
  { label, registryAddress }: GetResourceParameters,
): Promise<GetResourceReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  const currentRegistry =
    registryAddress ??
    getChainContractAddress({
      chain: client.chain,
      contract: 'ensRegistry',
    })

  const labelHash = labelToCanonicalId(label)

  return readContractAction({
    address: currentRegistry,
    abi: permissionedRegistryGetResourceSnippet,
    functionName: 'getResource',
    args: [labelHash],
  })
}
