import type { Client, ReadContractErrorType } from 'viem'
import type { Address } from 'viem/accounts'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { eacHasRolesSnippet } from '../../../contracts/enhancedAccessControl.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { labelToCanonicalId } from '../../../utils/v2/registry/labelToCanonicalId.js'
import {
  encodeRoleBitmap,
  type Role,
} from '../../../utils/v2/roles/encodeRoleBitmap.js'

export type HasRolesParameters = {
  /** The registry address to check */
  registryAddress: Address
  /** The label to check roles for */
  label: string
  /** The roles to check */
  roles: Role[]
  /** The account address to check */
  account: Address
}

export type HasRolesReturnType = boolean

export type HasRolesErrorType = ReadContractErrorType

/**
 * Check if an account has specific roles for a name.
 * @param client - {@link Client}
 * @param parameters - {@link HasRolesParameters}
 * @returns Boolean indicating if the account has the roles. {@link HasRolesReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { hasRoles } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const hasRole = await hasRoles(client, {
 *   registryAddress: '0x...',
 *   label: 'example',
 *   roles: ['ROLE_SET_SUBREGISTRY'],
 *   account: '0x...',
 * })
 * // true or false
 */
export async function hasRoles(
  client: Client,
  { registryAddress, label, roles, account }: HasRolesParameters,
): Promise<HasRolesReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  const resource = labelToCanonicalId(label)
  const rolesBitmap = encodeRoleBitmap(roles)

  return readContractAction({
    address: registryAddress,
    abi: eacHasRolesSnippet,
    functionName: 'hasRoles',
    args: [resource, rolesBitmap, account],
  })
}
