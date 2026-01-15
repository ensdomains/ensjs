import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { getOwner } from './getOwner.js'

const client = createPublicClient({
  chain: sepolia,
  transport: http(
    'https://lb.drpc.live/sepolia/AnmpasF2C0JBqeAEzxVO8aRo7Ju0xlER8JS4QmlfqV1j',
  ),
})

describe('getOwner', () => {
  it('returns the owner address for a V2 name', async () => {
    const owner = await getOwner(client, {
      registryAddress: '0xF332544e6234f1CA149907D0d4658afD5feB6831',
      label: 'ens2',
    })

    expect(owner).toMatch(/^0x[a-fA-F0-9]{40}$/)
    expect(owner).toEqual('0x205d2686da3Bf33f64C17f21462c51B5eaD462CF')
  })

  it('returns the owner address for another existing V2 name', async () => {
    const owner = await getOwner(client, {
      registryAddress: '0xF332544e6234f1CA149907D0d4658afD5feB6831',
      label: 'ens1',
    })

    expect(owner).toMatch(/^0x[a-fA-F0-9]{40}$/)
  })

  it('returns zero address for a non-existent label', async () => {
    const owner = await getOwner(client, {
      registryAddress: '0xF332544e6234f1CA149907D0d4658afD5feB6831',
      label: 'thislabeldoesnotexistatall',
    })

    expect(owner).toEqual('0x0000000000000000000000000000000000000000')
  })
})
