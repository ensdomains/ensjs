import type { Address, Client, Hex, ReadContractErrorType } from 'viem'
import { encodePacked, keccak256 } from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { eacHasRolesSnippet } from '../../../contracts/enhancedAccessControl.js'
import {
  permissionedResolverHasRolesSnippet,
  permissionedResolverHasRootRolesSnippet,
} from '../../../contracts/permissionedRegistry.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { labelToCanonicalId } from '../../../utils/v2/registry/labelToCanonicalId.js'
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
  | HasRolesResolverRootParameters
  | HasRolesResolverParameters

export type HasRolesErrorType = ReadContractErrorType

/**
 * Check if an account has specific roles.
 *
 * Supports three modes based on the parameters passed:
 *
 * **Registry mode** (pass `registryAddress` + `label`):
 * Check roles on a registry for a specific name.
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

  // Registry mode: registryAddress + label
  if ('registryAddress' in params) {
    const { registryAddress, label, roles, account } = params
    const resource = labelToCanonicalId(label)
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

/**
 * Compute a PermissionedResolver EAC resource ID from a node and part.
 * Mirrors `PermissionedResolverLib.resource(node, part)` in Solidity.
 *
 * @param node - The namehash of the name (bytes32). Use '0x00...00' for "any name".
 * @param part - The record-type part (bytes32). Use '0x00...00' for "any record type".
 * @returns The resource ID as a bigint.
 */
export function computeResolverResource(node: Hex, part: Hex): bigint {
  return BigInt(keccak256(encodePacked(['bytes32', 'bytes32'], [node, part])))
}
