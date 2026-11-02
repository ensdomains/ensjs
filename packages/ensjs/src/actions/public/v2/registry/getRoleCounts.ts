import { permissionedRegistryRoleCountSnippet } from '@ensdomains/ensjs-abi/v2/permissionedRegistry'
import { type Client, labelhash } from 'viem'
import type { Address } from 'viem/accounts'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../../types/internal.js'
import {
  type DecodeRoleCountsReturnType,
  decodeRoleCounts,
  registryRoles,
} from '../../../../utils/v2/index.js'

export type GetRoleCountsParameters =
  | {
      /** The registry address */
      registryAddress: Address
      /** The label to count roles for */
      label: string
    }
  | {
      /** The registry address; without a label, counts its registry-wide (root) roles */
      registryAddress: Address
    }

export type GetRoleCountsReturnType = {
  decoded: DecodeRoleCountsReturnType<typeof registryRoles>
  raw: bigint
}

export type GetRoleCountsErrorType = ReadContractErrorType

/**
 * Gets the registry's role counts for a name's label, or for the registry root
 * (resource 0) when no label is passed.
 * @param client - {@link Client}
 * @param parameters - {@link GetRoleCountsParameters}
 * @returns Decoded and raw role counts. {@link GetRoleCountsReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getRoleCounts } from '@ensdomains/ensjs/public/v2'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getRoleCounts(client, { registryAddress: '0x0f3eb298470639a96bd548cea4a648bc80b2cee2', label: 'raffy' })
 *
 * @example
 * // Registry-wide roles at the root resource
 * const root = await getRoleCounts(client, { registryAddress: '0x0f3eb298470639a96bd548cea4a648bc80b2cee2' })
 */
export async function getRoleCounts(
  client: Client,
  params: GetRoleCountsParameters,
): Promise<GetRoleCountsReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  const resource = 'label' in params ? BigInt(labelhash(params.label)) : 0n

  const roleBitmap = await readContractAction({
    address: params.registryAddress,
    abi: permissionedRegistryRoleCountSnippet,
    functionName: 'roleCount',
    args: [resource],
  })

  return {
    decoded: decodeRoleCounts(roleBitmap, registryRoles),
    raw: roleBitmap,
  }
}
