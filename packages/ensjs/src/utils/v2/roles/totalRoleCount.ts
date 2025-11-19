import { REGISTRY_ROLES } from './constants.js'
import {
  type DecodeRoleCountsErrorType,
  decodeRoleCounts,
} from './decodeRoleCounts.js'

export type TotalRoleCountErrorType = DecodeRoleCountsErrorType

/**
 * Get a total count of all roles on a token
 * @param encodedRoleCounts role bitmap
 */
export const totalRoleCount = (encodedRoleCounts: number | bigint) =>
  Object.values(
    decodeRoleCounts([...REGISTRY_ROLES], encodedRoleCounts),
  ).reduce((a, b) => a + b)
