import { eacHasRolesSnippet } from '@ensdomains/ensjs-abi/v2/enhancedAccessControl'
import {
  permissionedResolverHasRolesSnippet,
  permissionedResolverHasRootRolesSnippet,
} from '@ensdomains/ensjs-abi/v2/permissionedResolver'
import {
  type Address,
  type Client,
  labelhash,
  type ReadContractErrorType,
} from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import {
  encodeRoleBitmap,
  type Role,
} from '../../../utils/v2/roles/encodeRoleBitmap.js'
import {
  encodeResolverRoleBitmap,
  type ResolverRole,
} from '../../../utils/v2/roles/resolverRoles.js'

// ─── Registry mode ────────────────────────────────────────────────────

export type HasRolesRegistryParameters = {
  /** The registry address to check */
  registryAddress: Address
  /** The label to check roles for */
  label: string
  /** The roles to check */
  roles: Role[]
  /** The account address to check */
  account: Address
}

// ─── Registry root mode ───────────────────────────────────────────────

export type HasRolesRegistryRootParameters = {
  /** The registry address to check */
  registryAddress: Address
  /** The roles to check at the registry root resource */
  roles: Role[]
  /** The account address to check */
  account: Address
}

// ─── Resolver root mode ───────────────────────────────────────────────

export type HasRolesResolverRootParameters = {
  /** The resolver address to check */
  resolverAddress: Address
  /** The resolver roles to check */
  roles: ResolverRole[]
  /** The account address to check */
  account: Address
}

// ─── Resolver mode (with resource) ────────────────────────────────────

export type HasRolesResolverParameters = {
  /** The resolver address to check */
  resolverAddress: Address
  /** The EAC resource to check roles on */
  resource: bigint
  /** The resolver roles to check */
  roles: ResolverRole[]
  /** The account address to check */
  account: Address
}

// ─── Union type ───────────────────────────────────────────────────────

export type HasRolesParameters =
  | HasRolesRegistryParameters
  | HasRolesRegistryRootParameters
  | HasRolesResolverRootParameters
  | HasRolesResolverParameters

export type HasRolesErrorType = ReadContractErrorType

/**
 * Check if an account has specific roles.
 *
 * Supports four modes based on the parameters passed:
 *
 * **Registry mode** (pass `registryAddress` + `label`):
 * Check roles on a registry for a specific name.
 *
 * **Registry root mode** (pass `registryAddress` only):
 * Check registry-wide roles at the root resource (resource = 0).
 *
 * **Resolver root mode** (pass `resolverAddress` only):
 * Check root-level roles on a resolver (global, any name/record).
 *
 * **Resolver mode** (pass `resolverAddress` + `resource`):
 * Check roles on a resolver for a specific resource.
 *
 * @param client - {@link Client}
 * @param parameters - {@link HasRolesParameters}
 * @returns Boolean indicating if the account has the roles.
 *
 * @example
 * // Registry mode - check registry roles for a name
 * const hasRole = await hasRoles(client, {
 *   registryAddress: '0x...',
 *   label: 'example',
 *   roles: ['ROLE_SET_SUBREGISTRY'],
 *   account: '0x...',
 * })
 *
 * @example
 * // Registry root mode - check registry-wide root roles
 * const isAdmin = await hasRoles(client, {
 *   registryAddress: '0x...',
 *   roles: ['ROLE_REGISTRAR_ADMIN'],
 *   account: '0x...',
 * })
 *
 * @example
 * // Resolver root mode - check global resolver roles
 * const canSetAlias = await hasRoles(client, {
 *   resolverAddress: '0x...',
 *   roles: ['ROLE_SET_ALIAS'],
 *   account: '0x...',
 * })
 *
 * @example
 * // Resolver mode - check resolver roles for a specific resource
 * const canSetText = await hasRoles(client, {
 *   resolverAddress: '0x...',
 *   resource: computeResolverResource(namehash('myname.eth'), '0x0000000000000000000000000000000000000000000000000000000000000000'),
 *   roles: ['ROLE_SET_TEXT'],
 *   account: '0x...',
 * })
 */
export async function hasRoles(
  client: Client,
  params: HasRolesParameters,
): Promise<boolean> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  // Registry mode: registryAddress + (label | root resource)
  if ('registryAddress' in params) {
    const { registryAddress, roles, account } = params
    const resource = 'label' in params ? BigInt(labelhash(params.label)) : 0n
    const rolesBitmap = encodeRoleBitmap(roles)

    return readContractAction({
      address: registryAddress,
      abi: eacHasRolesSnippet,
      functionName: 'hasRoles',
      args: [resource, rolesBitmap, account],
    })
  }

  // Resolver mode (with resource): resolverAddress + resource
  if ('resource' in params) {
    const { resolverAddress, resource, roles, account } = params
    const roleBitmap = encodeResolverRoleBitmap(roles)

    return readContractAction({
      address: resolverAddress,
      abi: permissionedResolverHasRolesSnippet,
      functionName: 'hasRoles',
      args: [resource, roleBitmap, account],
    })
  }

  // Resolver root mode: resolverAddress only (no resource)
  const { resolverAddress, roles, account } = params
  const roleBitmap = encodeResolverRoleBitmap(roles)

  return readContractAction({
    address: resolverAddress,
    abi: permissionedResolverHasRootRolesSnippet,
    functionName: 'hasRootRoles',
    args: [roleBitmap, account],
  })
}

export { computeResolverResource } from '../../../utils/v2/roles/resolverResource.js'
