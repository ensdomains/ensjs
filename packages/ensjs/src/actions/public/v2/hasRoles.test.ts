import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { hasRoles } from './hasRoles.js'

const client = createPublicClient({
  chain: sepolia,
  transport: http(
    'https://lb.drpc.live/sepolia/AnmpasF2C0JBqeAEzxVO8aRo7Ju0xlER8JS4QmlfqV1j',
  ),
})

describe('hasRoles', () => {
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
