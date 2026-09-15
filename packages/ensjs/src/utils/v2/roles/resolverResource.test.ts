import { decodeFunctionData, keccak256, stringToHex, toHex } from 'viem'
import { describe, expect, it } from 'vitest'
import {
  computeResolverResource,
  encodeResolverSetterScope,
  RESOLVER_ROOT_RESOURCE,
  resolverSetterScopeRole,
} from './resolverResource.js'

describe('computeResolverResource', () => {
  it('hashes a coin type as a 32-byte word', () => {
    expect(computeResolverResource({ kind: 'address', coinType: 60n })).toBe(
      BigInt(keccak256(toHex(60n, { size: 32 }))),
    )
  })

  it('hashes a content type as a 32-byte word', () => {
    expect(computeResolverResource({ kind: 'abi', contentType: 1n })).toBe(
      BigInt(keccak256(toHex(1n, { size: 32 }))),
    )
  })

  it('hashes text and data keys as their raw bytes', () => {
    const expected = BigInt(keccak256(stringToHex('avatar')))
    expect(computeResolverResource({ kind: 'text', key: 'avatar' })).toBe(
      expected,
    )
    expect(computeResolverResource({ kind: 'data', key: 'avatar' })).toBe(
      expected,
    )
  })

  it('hashes an interface id as 4 bytes', () => {
    expect(
      computeResolverResource({ kind: 'interface', interfaceId: '0x9061b923' }),
    ).toBe(BigInt(keccak256('0x9061b923')))
  })

  it('never yields the root resource', () => {
    expect(computeResolverResource({ kind: 'text', key: '' })).not.toBe(
      RESOLVER_ROOT_RESOURCE,
    )
  })
})

describe('encodeResolverSetterScope', () => {
  it('encodes a decodable setter call for each scope', () => {
    const address = decodeFunctionData({
      abi: [
        {
          name: 'setAddress',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'name', type: 'bytes' },
            { name: 'coinType', type: 'uint256' },
            { name: 'addressBytes', type: 'bytes' },
          ],
          outputs: [],
        },
      ] as const,
      data: encodeResolverSetterScope({ kind: 'address', coinType: 60n }),
    })
    expect(address.args).toEqual(['0x00', 60n, '0x'])

    const text = decodeFunctionData({
      abi: [
        {
          name: 'setText',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'name', type: 'bytes' },
            { name: 'key', type: 'string' },
            { name: 'value', type: 'string' },
          ],
          outputs: [],
        },
      ] as const,
      data: encodeResolverSetterScope({ kind: 'text', key: 'avatar' }),
    })
    expect(text.args).toEqual(['0x00', 'avatar', ''])
  })

  it('uses distinct selectors per setter', () => {
    const selectors = new Set(
      [
        encodeResolverSetterScope({ kind: 'address', coinType: 60n }),
        encodeResolverSetterScope({ kind: 'text', key: 'a' }),
        encodeResolverSetterScope({ kind: 'data', key: 'a' }),
        encodeResolverSetterScope({ kind: 'abi', contentType: 1n }),
        encodeResolverSetterScope({
          kind: 'interface',
          interfaceId: '0x9061b923',
        }),
      ].map((data) => data.slice(0, 10)),
    )
    expect(selectors.size).toBe(5)
  })
})

describe('resolverSetterScopeRole', () => {
  it('maps each scope to its setter role', () => {
    expect(resolverSetterScopeRole({ kind: 'address', coinType: 60n })).toBe(
      'ROLE_SET_ADDRESS',
    )
    expect(resolverSetterScopeRole({ kind: 'text', key: 'x' })).toBe(
      'ROLE_SET_TEXT',
    )
    expect(resolverSetterScopeRole({ kind: 'data', key: 'x' })).toBe(
      'ROLE_SET_DATA',
    )
    expect(resolverSetterScopeRole({ kind: 'abi', contentType: 1n })).toBe(
      'ROLE_SET_ABI',
    )
    expect(
      resolverSetterScopeRole({ kind: 'interface', interfaceId: '0x9061b923' }),
    ).toBe('ROLE_SET_INTERFACE')
  })
})
