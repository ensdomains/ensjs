/**
 * PermissionedResolver role constants.
 *
 * These are the bit positions for roles defined in PermissionedResolverLib.
 * They are different from registry roles (RegistryRolesLib) even though they
 * occupy the same bit positions.
 */

export const RESOLVER_ROLE_SET_ADDR = 1n << 0n
export const RESOLVER_ROLE_SET_TEXT = 1n << 4n
export const RESOLVER_ROLE_SET_CONTENTHASH = 1n << 8n
export const RESOLVER_ROLE_SET_PUBKEY = 1n << 12n
export const RESOLVER_ROLE_SET_ABI = 1n << 16n
export const RESOLVER_ROLE_SET_INTERFACE = 1n << 20n
export const RESOLVER_ROLE_SET_NAME = 1n << 24n
export const RESOLVER_ROLE_SET_ALIAS = 1n << 28n
export const RESOLVER_ROLE_CLEAR = 1n << 32n
export const RESOLVER_ROLE_UPGRADE = 1n << 124n

export const RESOLVER_ROLE_SET_ADDR_ADMIN = RESOLVER_ROLE_SET_ADDR << 128n
export const RESOLVER_ROLE_SET_TEXT_ADMIN = RESOLVER_ROLE_SET_TEXT << 128n
export const RESOLVER_ROLE_SET_CONTENTHASH_ADMIN = RESOLVER_ROLE_SET_CONTENTHASH << 128n
export const RESOLVER_ROLE_SET_PUBKEY_ADMIN = RESOLVER_ROLE_SET_PUBKEY << 128n
export const RESOLVER_ROLE_SET_ABI_ADMIN = RESOLVER_ROLE_SET_ABI << 128n
export const RESOLVER_ROLE_SET_INTERFACE_ADMIN = RESOLVER_ROLE_SET_INTERFACE << 128n
export const RESOLVER_ROLE_SET_NAME_ADMIN = RESOLVER_ROLE_SET_NAME << 128n
export const RESOLVER_ROLE_SET_ALIAS_ADMIN = RESOLVER_ROLE_SET_ALIAS << 128n
export const RESOLVER_ROLE_CLEAR_ADMIN = RESOLVER_ROLE_CLEAR << 128n
export const RESOLVER_ROLE_UPGRADE_ADMIN = RESOLVER_ROLE_UPGRADE << 128n

export type ResolverRole =
  | 'ROLE_SET_ADDR'
  | 'ROLE_SET_TEXT'
  | 'ROLE_SET_CONTENTHASH'
  | 'ROLE_SET_PUBKEY'
  | 'ROLE_SET_ABI'
  | 'ROLE_SET_INTERFACE'
  | 'ROLE_SET_NAME'
  | 'ROLE_SET_ALIAS'
  | 'ROLE_CLEAR'
  | 'ROLE_UPGRADE'

const resolverRoleMap: Record<ResolverRole, bigint> = {
  ROLE_SET_ADDR: RESOLVER_ROLE_SET_ADDR,
  ROLE_SET_TEXT: RESOLVER_ROLE_SET_TEXT,
  ROLE_SET_CONTENTHASH: RESOLVER_ROLE_SET_CONTENTHASH,
  ROLE_SET_PUBKEY: RESOLVER_ROLE_SET_PUBKEY,
  ROLE_SET_ABI: RESOLVER_ROLE_SET_ABI,
  ROLE_SET_INTERFACE: RESOLVER_ROLE_SET_INTERFACE,
  ROLE_SET_NAME: RESOLVER_ROLE_SET_NAME,
  ROLE_SET_ALIAS: RESOLVER_ROLE_SET_ALIAS,
  ROLE_CLEAR: RESOLVER_ROLE_CLEAR,
  ROLE_UPGRADE: RESOLVER_ROLE_UPGRADE,
}

/**
 * Encode an array of resolver role names into a single bitmap.
 */
export function encodeResolverRoleBitmap(roles: ResolverRole[]): bigint {
  let bitmap = 0n
  for (const role of roles) {
    bitmap |= resolverRoleMap[role]
  }
  return bitmap
}
