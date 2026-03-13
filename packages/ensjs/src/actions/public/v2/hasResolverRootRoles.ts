import type { Address, Client, ReadContractErrorType } from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { permissionedResolverHasRootRolesSnippet } from '../../../contracts/permissionedRegistry.js'
import {
  encodeResolverRoleBitmap,
  type ResolverRole,
} from '../../../utils/v2/roles/resolverRoles.js'

export type HasResolverRootRolesParameters = {
  /** The resolver address to check */
  resolverAddress: Address
  /** The resolver roles to check */
  roles: ResolverRole[]
  /** The account address to check */
  account: Address
}

export type HasResolverRootRolesReturnType = boolean

export type HasResolverRootRolesErrorType = ReadContractErrorType

/**
 * Check if an account has specific root-level roles on a PermissionedResolver.
 *
 * Root roles apply globally (any name, any record type). Use this for
 * roles like ROLE_SET_ALIAS which are root-only, or to check if an
 * account is a global admin.
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { sepolia } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: sepolia,
 *   transport: http(),
 * })
 *
 * const canSetAlias = await hasResolverRootRoles(client, {
 *   resolverAddress: '0x932c8ea8870162b6b4686e86a0df5ab863994627',
 *   roles: ['ROLE_SET_ALIAS'],
 *   account: '0x205d2686da3Bf33f64C17f21462c51B5eaD462CF',
 * })
 * // true or false
 */
export async function hasResolverRootRoles(
  client: Client,
  { resolverAddress, roles, account }: HasResolverRootRolesParameters,
): Promise<HasResolverRootRolesReturnType> {
  const readContractAction = getAction(client, readContract, 'readContract')

  const roleBitmap = encodeResolverRoleBitmap(roles)

  return readContractAction({
    address: resolverAddress,
    abi: permissionedResolverHasRootRolesSnippet,
    functionName: 'hasRootRoles',
    args: [roleBitmap, account],
  })
}
