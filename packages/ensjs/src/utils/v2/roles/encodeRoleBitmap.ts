import * as registryRoles from './registryRoles.js'

export type Role = keyof typeof registryRoles

export const encodeRoleBitmap = (roleList: Role[]): bigint => {
  let bitmap = 0n

  for (const role of roleList) {
    // biome-ignore lint: roles are statically defined
    bitmap |= BigInt(registryRoles[role])
  }

  return bitmap
}
