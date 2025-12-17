import * as registryRoles from './registryRoles.js'

export type Role = keyof typeof registryRoles

export const encodeRoleBitmap = (roleList: Role[]): bigint =>
  // biome-ignore lint: all registry roles are statically defined
  roleList.reduce((a, x) => a | registryRoles[x], 0n)
