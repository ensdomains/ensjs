export type RoleNames = readonly string[]
export type RoleName<N extends RoleNames> = N[number] | `${N[number]}_ADMIN`

export type DecodeRoleCountsReturnType<T extends Record<string, bigint>> =
  Record<keyof T, number>

/**
 * Decode a role count bitmap into a mapping of a role and how many accounts have that role
 * @param keys set of role keys
 * @param encodedRoleCounts role bitmap
 * @returns mapping of a role and how many accounts have that role
 */
export function decodeRoleCounts<T extends Record<string, bigint>>(
  bitmap: bigint,
  roles: T,
): Record<keyof T, number> {
  return Object.fromEntries(
    Object.entries(roles).map(([k, x]) => {
      x |= x << 1n
      x |= x << 2n
      x &= bitmap
      while (x > 15n) x >>= 4n
      return [k, Number(x)] as const
    }),
  ) as Record<keyof T, number>
}
