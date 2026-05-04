import { describe, expect, it } from 'vitest'
import {
  encodeResolverRoleBitmap,
  RESOLVER_ROLE_CLEAR,
  RESOLVER_ROLE_CLEAR_ADMIN,
  RESOLVER_ROLE_SET_ABI,
  RESOLVER_ROLE_SET_ADDR,
  RESOLVER_ROLE_SET_ADDR_ADMIN,
  RESOLVER_ROLE_SET_ALIAS,
  RESOLVER_ROLE_SET_CONTENTHASH,
  RESOLVER_ROLE_SET_INTERFACE,
  RESOLVER_ROLE_SET_NAME,
  RESOLVER_ROLE_SET_PUBKEY,
  RESOLVER_ROLE_SET_TEXT,
  RESOLVER_ROLE_UPGRADE,
  RESOLVER_ROLE_UPGRADE_ADMIN,
} from './resolverRoles.js'

describe('resolver role constants', () => {
  it('each role occupies a distinct nybble', () => {
    const baseRoles = [
      RESOLVER_ROLE_SET_ADDR,
      RESOLVER_ROLE_SET_TEXT,
      RESOLVER_ROLE_SET_CONTENTHASH,
      RESOLVER_ROLE_SET_PUBKEY,
      RESOLVER_ROLE_SET_ABI,
      RESOLVER_ROLE_SET_INTERFACE,
      RESOLVER_ROLE_SET_NAME,
      RESOLVER_ROLE_SET_ALIAS,
      RESOLVER_ROLE_CLEAR,
      RESOLVER_ROLE_UPGRADE,
    ]

    for (let i = 0; i < baseRoles.length; i++) {
      for (let j = i + 1; j < baseRoles.length; j++) {
        expect(baseRoles[i] & baseRoles[j]).toBe(0n)
      }
    }
  })

  it('admin roles are shifted 128 bits from their base', () => {
    expect(RESOLVER_ROLE_SET_ADDR_ADMIN).toBe(RESOLVER_ROLE_SET_ADDR << 128n)
    expect(RESOLVER_ROLE_CLEAR_ADMIN).toBe(RESOLVER_ROLE_CLEAR << 128n)
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
    const bitmap = encodeResolverRoleBitmap(['ROLE_SET_TEXT', 'ROLE_CLEAR'])
    expect(bitmap).toBe(RESOLVER_ROLE_SET_TEXT | RESOLVER_ROLE_CLEAR)
  })

  it('is idempotent for duplicate roles', () => {
    const single = encodeResolverRoleBitmap(['ROLE_SET_ADDR'])
    const duplicate = encodeResolverRoleBitmap([
      'ROLE_SET_ADDR',
      'ROLE_SET_ADDR',
    ])
    expect(single).toBe(duplicate)
  })
})
