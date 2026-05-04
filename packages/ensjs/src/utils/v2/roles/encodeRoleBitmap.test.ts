import { describe, expect, it } from 'vitest'
import { encodeRoleBitmap } from './encodeRoleBitmap.js'
import * as registryRoles from './registryRoles.js'

describe('encodeRoleBitmap', () => {
  it('returns 0 for an empty role list', () => {
    expect(encodeRoleBitmap([])).toBe(0n)
  })

  it('encodes a single role', () => {
    expect(encodeRoleBitmap(['ROLE_REGISTRAR'])).toBe(
      registryRoles.ROLE_REGISTRAR,
    )
  })

  it('encodes multiple roles as a bitwise OR', () => {
    const bitmap = encodeRoleBitmap([
      'ROLE_SET_RESOLVER',
      'ROLE_SET_SUBREGISTRY',
    ])
    expect(bitmap).toBe(
      registryRoles.ROLE_SET_RESOLVER | registryRoles.ROLE_SET_SUBREGISTRY,
    )
  })

  it('is idempotent for duplicate roles', () => {
    const single = encodeRoleBitmap(['ROLE_RENEW'])
    const duplicate = encodeRoleBitmap(['ROLE_RENEW', 'ROLE_RENEW'])
    expect(single).toBe(duplicate)
  })
})
