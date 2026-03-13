import type {
  Account,
  Address,
  Chain,
  Client,
  Transport,
  WriteContractErrorType,
  WriteContractParameters,
  WriteContractReturnType,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import {
  permissionedResolverRevokeRolesSnippet,
  permissionedResolverRevokeRootRolesSnippet,
} from '../../../contracts/permissionedRegistry.js'
import {
  encodeResolverRoleBitmap,
  type ResolverRole,
} from '../../../utils/v2/roles/resolverRoles.js'

// ─── revokeResolverRootRoles ─────────────────────────────────────────

export type RevokeResolverRootRolesParameters = {
  /** The resolver address */
  resolverAddress: Address
  /** The resolver roles to revoke from ROOT_RESOURCE (global) */
  roles: ResolverRole[]
  /** The account to revoke roles from */
  account: Address
}

export type RevokeResolverRootRolesReturnType = WriteContractReturnType

export type RevokeResolverRootRolesErrorType = WriteContractErrorType

/**
 * Revoke root-level roles on a PermissionedResolver.
 *
 * Root roles apply globally — revoking them removes the account's
 * authorization for any name and any record type.
 *
 * The caller must hold the admin variant of each role being revoked
 * (e.g., ROLE_SET_ALIAS_ADMIN to revoke ROLE_SET_ALIAS).
 *
 * This calls `revokeRootRoles(roleBitmap, account)` on the resolver,
 * which is inherited from EnhancedAccessControl.
 *
 * @example
 * // Revoke ROLE_SET_ALIAS from an address
 * const hash = await revokeResolverRootRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   roles: ['ROLE_SET_ALIAS'],
 *   account: '0xOTHER_ADDRESS',
 * })
 */
export async function revokeResolverRootRoles<
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    resolverAddress,
    roles,
    account: targetAccount,
  }: RevokeResolverRootRolesParameters,
): Promise<RevokeResolverRootRolesReturnType> {
  const writeContractAction = getAction(client, writeContract, 'writeContract')

  const roleBitmap = encodeResolverRoleBitmap(roles)

  return writeContractAction({
    address: resolverAddress,
    abi: permissionedResolverRevokeRootRolesSnippet,
    functionName: 'revokeRootRoles',
    args: [roleBitmap, targetAccount],
    chain: client.chain,
    account: client.account,
  } as WriteContractParameters)
}

// ─── revokeResolverRoles ─────────────────────────────────────────────

export type RevokeResolverRolesParameters = {
  /** The resolver address */
  resolverAddress: Address
  /** The EAC resource to revoke roles on */
  resource: bigint
  /** The resolver roles to revoke */
  roles: ResolverRole[]
  /** The account to revoke roles from */
  account: Address
}

export type RevokeResolverRolesReturnType = WriteContractReturnType

export type RevokeResolverRolesErrorType = WriteContractErrorType

/**
 * Revoke roles on a PermissionedResolver for a specific resource.
 *
 * The resource determines the scope of the revocation.
 * Use `computeResolverResource(node, part)` to compute the resource ID.
 *
 * The caller must hold the admin variant of each role being revoked.
 *
 * This calls `revokeRoles(resource, roleBitmap, account)` on the resolver,
 * which is inherited from EnhancedAccessControl.
 *
 * @example
 * import { computeResolverResource, namehash } from '@ensdomains/ensjs/public/v2'
 *
 * // Revoke ROLE_SET_TEXT for a specific name
 * const hash = await revokeResolverRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   resource: computeResolverResource(namehash('myname.eth'), 0n),
 *   roles: ['ROLE_SET_TEXT'],
 *   account: '0xOTHER_ADDRESS',
 * })
 */
export async function revokeResolverRoles<
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    resolverAddress,
    resource,
    roles,
    account: targetAccount,
  }: RevokeResolverRolesParameters,
): Promise<RevokeResolverRolesReturnType> {
  const writeContractAction = getAction(client, writeContract, 'writeContract')

  const roleBitmap = encodeResolverRoleBitmap(roles)

  return writeContractAction({
    address: resolverAddress,
    abi: permissionedResolverRevokeRolesSnippet,
    functionName: 'revokeRoles',
    args: [resource, roleBitmap, targetAccount],
    chain: client.chain,
    account: client.account,
  } as WriteContractParameters)
}
