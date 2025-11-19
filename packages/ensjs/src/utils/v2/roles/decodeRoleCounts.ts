import type { NumberToHexErrorType } from 'viem'
import { uint4x64FromUint256 } from './utils.js'

export type DecodeRoleCountsErrorType = NumberToHexErrorType

type RoleNames = readonly string[]
type RoleName<N extends RoleNames> = N[number] | `${N[number]}_ADMIN`

/**
 * Decode a role count bitmap into a mapping of a role and how many accounts have that role
 * @param keys set of role keys
 * @param encodedRoleCounts role bitmap
 * @returns mapping of a role and how many accounts have that role
 */
export function decodeRoleCounts<N extends RoleNames>(
  keys: N,
  encodedRoleCounts: number | bigint,
): Record<RoleName<N>, number> {
  const roles = uint4x64FromUint256(encodedRoleCounts)
  return Object.fromEntries(
    keys.flatMap((k, i) => [
      [k, roles[63 - i]],
      [`${k}_ADMIN`, roles[31 - i]],
    ]),
  ) as Record<RoleName<N>, number>
}
