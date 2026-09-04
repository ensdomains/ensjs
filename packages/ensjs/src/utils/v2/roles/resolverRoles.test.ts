import { describe, expect, it } from 'vitest'
import {
  decodeResolverRoleBitmap,
  encodeResolverRoleBitmap,
  RESOLVER_ALL_ROLES,
  RESOLVER_ROLE_CAN_NAME,
  RESOLVER_ROLE_LINK,
  RESOLVER_ROLE_LINK_ADMIN,
  RESOLVER_ROLE_SET_ABI,
  RESOLVER_ROLE_SET_ADDRESS,
  RESOLVER_ROLE_SET_ADDRESS_ADMIN,
  RESOLVER_ROLE_SET_CONTENTHASH,
  RESOLVER_ROLE_SET_DATA,
  RESOLVER_ROLE_SET_INTERFACE,
  RESOLVER_ROLE_SET_NAME,
  RESOLVER_ROLE_SET_TEXT,
  RESOLVER_ROLE_UPGRADE,
  RESOLVER_ROLE_UPGRADE_ADMIN,
} from './resolverRoles.js'

describe('resolver role constants', () => {
  it('matches the post-audit-2 PermissionedResolverLib layout', () => {
    expect(RESOLVER_ROLE_SET_ADDRESS).toBe(1n << 0n)
    expect(RESOLVER_ROLE_SET_TEXT).toBe(1n << 4n)
    expect(RESOLVER_ROLE_SET_CONTENTHASH).toBe(1n << 8n)
    expect(RESOLVER_ROLE_SET_ABI).toBe(1n << 12n)
    expect(RESOLVER_ROLE_SET_INTERFACE).toBe(1n << 16n)
    expect(RESOLVER_ROLE_SET_NAME).toBe(1n << 20n)
    expect(RESOLVER_ROLE_SET_DATA).toBe(1n << 24n)
    expect(RESOLVER_ROLE_LINK).toBe(1n << 28n)
    expect(RESOLVER_ROLE_CAN_NAME).toBe(1n << 120n)
    expect(RESOLVER_ROLE_UPGRADE).toBe(1n << 124n)
  })

  it('each role occupies a distinct nybble', () => {
    const baseRoles = [
      RESOLVER_ROLE_SET_ADDRESS,
      RESOLVER_ROLE_SET_TEXT,
      RESOLVER_ROLE_SET_CONTENTHASH,
      RESOLVER_ROLE_SET_ABI,
      RESOLVER_ROLE_SET_INTERFACE,
      RESOLVER_ROLE_SET_NAME,
      RESOLVER_ROLE_SET_DATA,
      RESOLVER_ROLE_LINK,
      RESOLVER_ROLE_CAN_NAME,
      RESOLVER_ROLE_UPGRADE,
    ]

    for (let i = 0; i < baseRoles.length; i++) {
      for (let j = i + 1; j < baseRoles.length; j++) {
        expect(baseRoles[i] & baseRoles[j]).toBe(0n)
      }
    }
  })

  it('admin roles are shifted 128 bits from their base', () => {
    expect(RESOLVER_ROLE_SET_ADDRESS_ADMIN).toBe(
      RESOLVER_ROLE_SET_ADDRESS << 128n,
    )
    expect(RESOLVER_ROLE_LINK_ADMIN).toBe(RESOLVER_ROLE_LINK << 128n)
    expect(RESOLVER_ROLE_UPGRADE_ADMIN).toBe(RESOLVER_ROLE_UPGRADE << 128n)
  })
})

describe('encodeResolverRoleBitmap', () => {
  it('returns 0 for an empty role list', () => {
    expect(encodeResolverRoleBitmap([])).toBe(0n)
  })

  it('encodes a single role', () => {
    expect(encodeResolverRoleBitmap(['ROLE_SET_TEXT'])).toBe(
      RESOLVER_ROLE_SET_TEXT,
    )
  })

  it('encodes multiple roles as a bitwise OR', () => {
    expect(encodeResolverRoleBitmap(['ROLE_SET_TEXT', 'ROLE_LINK'])).toBe(
      RESOLVER_ROLE_SET_TEXT | RESOLVER_ROLE_LINK,
    )
  })

  it('encodes admin roles', () => {
    expect(encodeResolverRoleBitmap(['ROLE_LINK_ADMIN'])).toBe(
      RESOLVER_ROLE_LINK_ADMIN,
    )
  })

  it('is idempotent for duplicate roles', () => {
    expect(encodeResolverRoleBitmap(['ROLE_LINK', 'ROLE_LINK'])).toBe(
      RESOLVER_ROLE_LINK,
    )
  })
})

describe('decodeResolverRoleBitmap', () => {
  it('round-trips a bitmap', () => {
    const roles = ['ROLE_SET_ADDRESS', 'ROLE_SET_TEXT_ADMIN', 'ROLE_UPGRADE']
    expect(
      [
        ...decodeResolverRoleBitmap(
          encodeResolverRoleBitmap(
            roles as Parameters<typeof encodeResolverRoleBitmap>[0],
          ),
        ),
      ].sort(),
    ).toEqual([...roles].sort())
  })

  it('decodes RESOLVER_ALL_ROLES into every role', () => {
    expect(decodeResolverRoleBitmap(RESOLVER_ALL_ROLES)).toHaveLength(20)
  })

  it('returns an empty list for 0', () => {
    expect(decodeResolverRoleBitmap(0n)).toEqual([])
  })
})
