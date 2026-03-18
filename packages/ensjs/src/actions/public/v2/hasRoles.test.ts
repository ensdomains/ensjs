import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { computeResolverResource, hasRoles } from './hasRoles.js'

const client = createPublicClient({
  chain: sepolia,
  transport: http(
    'https://lb.drpc.live/sepolia/AnmpasF2C0JBqeAEzxVO8aRo7Ju0xlER8JS4QmlfqV1j',
  ),
})

describe('hasRoles', () => {
  describe('registry mode', () => {
    it('returns true when account has SET_SUBREGISTRY role', async () => {
      const result = await hasRoles(client, {
        registryAddress: '0xF332544e6234f1CA149907D0d4658afD5feB6831',
        label: 'ens2',
        roles: ['ROLE_SET_SUBREGISTRY'],
        account: '0x205d2686da3Bf33f64C17f21462c51B5eaD462CF',
      })

      expect(result).toBe(true)
    })

    it('returns true when account has SET_RESOLVER role', async () => {
      const result = await hasRoles(client, {
        registryAddress: '0xF332544e6234f1CA149907D0d4658afD5feB6831',
        label: 'ens2',
        roles: ['ROLE_SET_RESOLVER'],
        account: '0x205d2686da3Bf33f64C17f21462c51B5eaD462CF',
      })

      expect(result).toBe(true)
    })

    it('returns true when account has CAN_TRANSFER_ADMIN role', async () => {
      const result = await hasRoles(client, {
        registryAddress: '0xF332544e6234f1CA149907D0d4658afD5feB6831',
        label: 'ens2',
        roles: ['ROLE_CAN_TRANSFER_ADMIN'],
        account: '0x205d2686da3Bf33f64C17f21462c51B5eaD462CF',
      })

      expect(result).toBe(true)
    })

    it('returns true when account has all three roles', async () => {
      const result = await hasRoles(client, {
        registryAddress: '0xF332544e6234f1CA149907D0d4658afD5feB6831',
        label: 'ens2',
        roles: [
          'ROLE_SET_SUBREGISTRY',
          'ROLE_SET_RESOLVER',
          'ROLE_CAN_TRANSFER_ADMIN',
        ],
        account: '0x205d2686da3Bf33f64C17f21462c51B5eaD462CF',
      })

      expect(result).toBe(true)
    })

    it('returns false when account does not have the specified role', async () => {
      const result = await hasRoles(client, {
        registryAddress: '0xF332544e6234f1CA149907D0d4658afD5feB6831',
        label: 'ens2',
        roles: ['ROLE_SET_SUBREGISTRY'],
        account: '0x0000000000000000000000000000000000000001',
      })

      expect(result).toBe(false)
    })
  })

  describe('resolver root mode', () => {
    it('returns true when account has root-level ROLE_SET_ALIAS', async () => {
      const result = await hasRoles(client, {
        resolverAddress: '0x932c8ea8870162b6b4686e86a0df5ab863994627',
        roles: ['ROLE_SET_ALIAS'],
        account: '0x205d2686da3Bf33f64C17f21462c51B5eaD462CF',
      })

      expect(result).toBe(true)
    })

    it('returns false when account does not have root role', async () => {
      const result = await hasRoles(client, {
        resolverAddress: '0x932c8ea8870162b6b4686e86a0df5ab863994627',
        roles: ['ROLE_SET_ALIAS'],
        account: '0x0000000000000000000000000000000000000001',
      })

      expect(result).toBe(false)
    })
  })

  describe('resolver mode (with resource)', () => {
    it('returns true when account has role for resource', async () => {
      const result = await hasRoles(client, {
        resolverAddress: '0x932c8ea8870162b6b4686e86a0df5ab863994627',
        resource: 0n,
        roles: ['ROLE_SET_TEXT'],
        account: '0x205d2686da3Bf33f64C17f21462c51B5eaD462CF',
      })

      expect(result).toBe(true)
    })

    it('returns false when account does not have role for resource', async () => {
      const result = await hasRoles(client, {
        resolverAddress: '0x932c8ea8870162b6b4686e86a0df5ab863994627',
        resource: computeResolverResource(
          '0x0000000000000000000000000000000000000000000000000000000000000001',
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        ),
        roles: ['ROLE_SET_TEXT'],
        account: '0x0000000000000000000000000000000000000001',
      })

      expect(result).toBe(false)
    })
  })
})

describe('computeResolverResource', () => {
  it('computes resource from hex inputs', () => {
    const resource = computeResolverResource(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )
    expect(typeof resource).toBe('bigint')
  })
})
