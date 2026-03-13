import type { Address, Client, Hex, ReadContractErrorType } from 'viem'
import { encodePacked, keccak256, toHex } from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { permissionedResolverHasRolesSnippet } from '../../../contracts/permissionedRegistry.js'
import {
  encodeResolverRoleBitmap,
  type ResolverRole,
} from '../../../utils/v2/roles/resolverRoles.js'

export type HasResolverRolesParameters = {
  /** The resolver address to check */
  resolverAddress: Address
  /** The EAC resource to check roles on. Use 0n for ROOT_RESOURCE (global). */
  resource: bigint
  /** The resolver roles to check */
  roles: ResolverRole[]
  /** The account address to check */
  account: Address
}

export type HasResolverRolesReturnType = boolean

export type HasResolverRolesErrorType = ReadContractErrorType

/**
 * Check if an account has specific roles on a PermissionedResolver for a given resource.
 *
 * The resource determines the scope:
 * - `0n` (ROOT_RESOURCE): global — checks if the account has the role for any name.
 * - `resource(node, 0)`: name-level — checks a specific name, any record type.
 * - `resource(node, part)`: fine-grained — checks a specific name + record type.
 *
 * Note: `hasRoles` implicitly also checks ROOT_RESOURCE as a fallback.
 * So if the account has the role globally, it will return true for any resource.
 *
 * @example
 * import { createPublicClient, http, namehash, keccak256, toBytes } from 'viem'
 * import { sepolia } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: sepolia,
 *   transport: http(),
 * })
 *
 * // Check global (root) permission to set text records
 * const canSetTextGlobal = await hasResolverRoles(client, {
 *   resolverAddress: '0x...',
 *   resource: 0n,
 *   roles: ['ROLE_SET_TEXT'],
 *   account: '0x...',
 * })
 *
 * // Check name-level permission
 * // resource = keccak256(abi.encode(namehash("myname.eth"), bytes32(0)))
 * const canSetTextForName = await hasResolverRoles(client, {
 *   resolverAddress: '0x...',
 *   resource: computeResolverResource(namehash("myname.eth"), 0n),
 *   roles: ['ROLE_SET_TEXT'],
 *   account: '0x...',
 * })
 */
export async function hasResolverRoles(
  client: Client,
  { resolverAddress, resource, roles, account }: HasResolverRolesParameters,
): Promise<HasResolverRolesReturnType> {
  const readContractAction = getAction(client, readContract, 'readContract')

  const roleBitmap = encodeResolverRoleBitmap(roles)

  return readContractAction({
    address: resolverAddress,
    abi: permissionedResolverHasRolesSnippet,
    functionName: 'hasRoles',
    args: [resource, roleBitmap, account],
  })
}

/**
 * Compute a PermissionedResolver EAC resource ID from a node and part.
 * Mirrors `PermissionedResolverLib.resource(node, part)` in Solidity.
 *
 * @param node - The namehash of the name (bytes32). Use 0n for "any name".
 * @param part - The record-type part (bytes32). Use 0n for "any record type".
 * @returns The resource ID as a bigint.
 */
export function computeResolverResource(
  node: Hex | bigint,
  part: Hex | bigint,
): bigint {
  const nodeHex = typeof node === 'bigint' ? toHex(node, { size: 32 }) : node
  const partHex = typeof part === 'bigint' ? toHex(part, { size: 32 }) : part
  return BigInt(
    keccak256(encodePacked(['bytes32', 'bytes32'], [nodeHex, partHex])),
  )
}
