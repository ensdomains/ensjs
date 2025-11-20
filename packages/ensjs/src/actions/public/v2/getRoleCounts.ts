import { type Client, labelhash } from 'viem'
import type { Address } from 'viem/accounts'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction, hexToBigInt } from 'viem/utils'
import { permissionedRegistryRoleCountSnippet } from '../../../contracts/permissionedRegistry.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import {
  type DecodeRoleCountsReturnType,
  decodeRoleCounts,
  REGISTRY_ROLES,
} from '../../../utils/v2/index.js'

export type GetRoleCountsParameters = {
  registryAddress: Address
  label: string
}

export type GetRoleCountsReturnType = {
  decoded: DecodeRoleCountsReturnType<typeof REGISTRY_ROLES>
  raw: bigint
}

export type GetRoleCountsErrorType = ReadContractErrorType

/**
 * Gets the registry's role counts for a name's label.
 * @param client - {@link Client}
 * @param parameters - {@link GetRoleCountsParameters}
 * @returns Resolver address, or null if none is found. {@link GetRoleCountsReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { GetRoleCounts } from '@ensdomains/ensjs/public/v2'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getRoleCounts(client, { resolverAddress: '0x123', label: 'raffy' })
 * // {
 *  // CAN_TRANSFER: 0,
 *  // SET_SUBREGISTRY: 2,
 *  // SET_SUBREGISTRY_ADMIN: 1,
 *  // SET_RESOLVER: 3,
 *  // SET_RESOLVER_ADMIN: 1,
 *  // CAN_TRANSFER_ADMIN: 1,
 *  // REGISTRAR: 0,
 *  // REGISTRAR_ADMIN: 0,
 *  // RENEW: 0,
 *  // RENEW_ADMIN: 0,
 *  // SET_TOKEN_OBSERVER: 0,
 *  // SET_TOKEN_OBSERVER_ADMIN: 0,
 *  // UNREGISTER: 0,
 *  // UNREGISTER_ADMIN: 0,
 *}
 */
export async function getRoleCounts(
  client: Client,
  { registryAddress, label }: GetRoleCountsParameters,
): Promise<GetRoleCountsReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  const roleBitmap = await readContractAction({
    address: registryAddress,
    abi: permissionedRegistryRoleCountSnippet,
    functionName: 'roleCount',
    args: [hexToBigInt(labelhash(label))],
  })

  return {
    decoded: decodeRoleCounts(REGISTRY_ROLES, roleBitmap),
    raw: roleBitmap,
  }
}
