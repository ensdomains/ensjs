import { describe, expect, it } from 'vitest'
import * as roles from './registryRoles.js'

describe('registryRoles', () => {
  it('each role occupies a distinct nybble', () => {
    const baseRoles = [
      roles.ROLE_REGISTRAR,
      roles.ROLE_REGISTER_RESERVED,
      roles.ROLE_SET_PARENT,
      roles.ROLE_UNREGISTER,
      roles.ROLE_RENEW,
      roles.ROLE_SET_SUBREGISTRY,
      roles.ROLE_SET_RESOLVER,
      roles.ROLE_UPGRADE,
    ]

    // no two base roles should share any bits
    for (let i = 0; i < baseRoles.length; i++) {
      for (let j = i + 1; j < baseRoles.length; j++) {
        expect(baseRoles[i] & baseRoles[j]).toBe(0n)
      }
    }
  })

  it('admin roles are shifted 128 bits from their base', () => {
    expect(roles.ROLE_REGISTRAR_ADMIN).toBe(roles.ROLE_REGISTRAR << 128n)
    expect(roles.ROLE_RENEW_ADMIN).toBe(roles.ROLE_RENEW << 128n)
    expect(roles.ROLE_SET_RESOLVER_ADMIN).toBe(roles.ROLE_SET_RESOLVER << 128n)
    expect(roles.ROLE_UPGRADE_ADMIN).toBe(roles.ROLE_UPGRADE << 128n)
  })

  it('ROLE_CAN_TRANSFER_ADMIN has no base role', () => {
    // CAN_TRANSFER is admin-only: (1n << 28n) << 128n
    expect(roles.ROLE_CAN_TRANSFER_ADMIN).toBe((1n << 28n) << 128n)
  })

  it('exports the expected number of roles', () => {
    expect(Object.keys(roles)).toHaveLength(20)
  })
})
