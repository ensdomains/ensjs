/**
 * PermissionedResolver role constants (contracts-v2 `post-audit-2`,
 * `PermissionedResolverLib`).
 *
 * Same nybble-packed layout as registry roles but with resolver meanings, so
 * never mix the two sets. A role is held on the root resource (every name on
 * the resolver) or on one setter argument's resource; there is no per-name
 * scope.
 */

/** Nybble 0 — set address records. Root or per coin type. */
export const RESOLVER_ROLE_SET_ADDRESS = 1n << 0n
/** Nybble 1 — set text records. Root or per text key. */
export const RESOLVER_ROLE_SET_TEXT = 1n << 4n
/** Nybble 2 — set the contenthash record. Root only. */
export const RESOLVER_ROLE_SET_CONTENTHASH = 1n << 8n
/** Nybble 3 — set ABI records. Root or per content type. */
export const RESOLVER_ROLE_SET_ABI = 1n << 12n
/** Nybble 4 — set interface implementer records. Root or per interface id. */
export const RESOLVER_ROLE_SET_INTERFACE = 1n << 16n
/** Nybble 5 — set the reverse name record. Root only. */
export const RESOLVER_ROLE_SET_NAME = 1n << 20n
/** Nybble 6 — set data records. Root or per data key. */
export const RESOLVER_ROLE_SET_DATA = 1n << 24n
/** Nybble 7 — link names to records. Root only. */
export const RESOLVER_ROLE_LINK = 1n << 28n
/** Nybble 30 — name the resolver contract itself. Root only. */
export const RESOLVER_ROLE_CAN_NAME = 1n << 120n
/** Nybble 31 — UUPS proxy upgrades. Root only. */
export const RESOLVER_ROLE_UPGRADE = 1n << 124n

export const RESOLVER_ROLE_SET_ADDRESS_ADMIN = RESOLVER_ROLE_SET_ADDRESS << 128n
export const RESOLVER_ROLE_SET_TEXT_ADMIN = RESOLVER_ROLE_SET_TEXT << 128n
export const RESOLVER_ROLE_SET_CONTENTHASH_ADMIN =
  RESOLVER_ROLE_SET_CONTENTHASH << 128n
export const RESOLVER_ROLE_SET_ABI_ADMIN = RESOLVER_ROLE_SET_ABI << 128n
export const RESOLVER_ROLE_SET_INTERFACE_ADMIN =
  RESOLVER_ROLE_SET_INTERFACE << 128n
export const RESOLVER_ROLE_SET_NAME_ADMIN = RESOLVER_ROLE_SET_NAME << 128n
export const RESOLVER_ROLE_SET_DATA_ADMIN = RESOLVER_ROLE_SET_DATA << 128n
export const RESOLVER_ROLE_LINK_ADMIN = RESOLVER_ROLE_LINK << 128n
export const RESOLVER_ROLE_CAN_NAME_ADMIN = RESOLVER_ROLE_CAN_NAME << 128n
export const RESOLVER_ROLE_UPGRADE_ADMIN = RESOLVER_ROLE_UPGRADE << 128n

/** Bitmap holding every resolver role and every admin role. */
export const RESOLVER_ALL_ROLES =
  0x1111111111111111111111111111111111111111111111111111111111111111n

const resolverRoleMap = {
  ROLE_SET_ADDRESS: RESOLVER_ROLE_SET_ADDRESS,
  ROLE_SET_TEXT: RESOLVER_ROLE_SET_TEXT,
  ROLE_SET_CONTENTHASH: RESOLVER_ROLE_SET_CONTENTHASH,
  ROLE_SET_ABI: RESOLVER_ROLE_SET_ABI,
  ROLE_SET_INTERFACE: RESOLVER_ROLE_SET_INTERFACE,
  ROLE_SET_NAME: RESOLVER_ROLE_SET_NAME,
  ROLE_SET_DATA: RESOLVER_ROLE_SET_DATA,
  ROLE_LINK: RESOLVER_ROLE_LINK,
  ROLE_CAN_NAME: RESOLVER_ROLE_CAN_NAME,
  ROLE_UPGRADE: RESOLVER_ROLE_UPGRADE,
  ROLE_SET_ADDRESS_ADMIN: RESOLVER_ROLE_SET_ADDRESS_ADMIN,
  ROLE_SET_TEXT_ADMIN: RESOLVER_ROLE_SET_TEXT_ADMIN,
  ROLE_SET_CONTENTHASH_ADMIN: RESOLVER_ROLE_SET_CONTENTHASH_ADMIN,
  ROLE_SET_ABI_ADMIN: RESOLVER_ROLE_SET_ABI_ADMIN,
  ROLE_SET_INTERFACE_ADMIN: RESOLVER_ROLE_SET_INTERFACE_ADMIN,
  ROLE_SET_NAME_ADMIN: RESOLVER_ROLE_SET_NAME_ADMIN,
  ROLE_SET_DATA_ADMIN: RESOLVER_ROLE_SET_DATA_ADMIN,
  ROLE_LINK_ADMIN: RESOLVER_ROLE_LINK_ADMIN,
  ROLE_CAN_NAME_ADMIN: RESOLVER_ROLE_CAN_NAME_ADMIN,
  ROLE_UPGRADE_ADMIN: RESOLVER_ROLE_UPGRADE_ADMIN,
} as const

export type ResolverRole = keyof typeof resolverRoleMap

/** Roles that can be narrowed to a setter argument. */
export type ResolverSetterRole =
  | 'ROLE_SET_ADDRESS'
  | 'ROLE_SET_TEXT'
  | 'ROLE_SET_DATA'
  | 'ROLE_SET_ABI'
  | 'ROLE_SET_INTERFACE'

/**
 * Encode an array of resolver role names into a single bitmap.
 */
export function encodeResolverRoleBitmap(
  roles: readonly ResolverRole[],
): bigint {
  let bitmap = 0n
  for (const role of roles) {
    bitmap |= resolverRoleMap[role]
  }
  return bitmap
}

/**
 * Decode a resolver role bitmap into the role names it holds.
 */
export function decodeResolverRoleBitmap(bitmap: bigint): ResolverRole[] {
  return (Object.keys(resolverRoleMap) as ResolverRole[]).filter(
    (role) => (bitmap & resolverRoleMap[role]) !== 0n,
  )
}
