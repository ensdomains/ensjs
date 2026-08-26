import { numberToHex } from 'viem'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
} from '../../test/addTestContracts.js'
import getOwner from './getOwner.js'

type RequestArguments = {
  method: string
  params?: readonly unknown[]
}

describe('getOwner', () => {
  it('should return correct ownership level and values for a wrapped .eth name', async () => {
    const result = await getOwner(publicClient, { name: 'wrapped.eth' })
    expect(result).toMatchInlineSnapshot(`
      {
        "owner": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "ownershipLevel": "nameWrapper",
      }
    `)
  })
  it('should return correct ownership level and values for an expired wrapped .eth name', async () => {
    const result = await getOwner(publicClient, { name: 'expired-wrapped.eth' })
    expect(result).toMatchInlineSnapshot(`
      {
        "owner": "${deploymentAddresses.NameWrapper}",
        "ownershipLevel": "registrar",
        "registrant": null,
      }
    `)
    // expect(result).toEqual({
    //   ownershipLevel: 'nameWrapper',
    //   owner: '0x0000000000000000000000000000000000000000',
    //   expired: true,
    // })
  })
  it('should return correct ownership level and values for an unwrapped .eth name', async () => {
    const result = await getOwner(publicClient, { name: 'test123.eth' })
    expect(result).toMatchInlineSnapshot(`
      {
        "owner": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "ownershipLevel": "registrar",
        "registrant": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      }
    `)
  })
  it('should return correct ownership level and values for an expired unwrapped .eth name', async () => {
    const result = await getOwner(publicClient, { name: 'expired.eth' })
    expect(result).toMatchInlineSnapshot(`
      {
        "owner": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "ownershipLevel": "registrar",
        "registrant": null,
      }
    `)
  })
  describe('subname', () => {
    it('should return correct ownership level and values for a unwrapped name', async () => {
      const result = await getOwner(publicClient, {
        name: 'test.with-subnames.eth',
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "owner": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          "ownershipLevel": "registry",
        }
      `)
    })
    it('should return correct ownership level and values for a wrapped name', async () => {
      const result = await getOwner(publicClient, {
        name: 'test.wrapped-with-subnames.eth',
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "owner": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          "ownershipLevel": "nameWrapper",
        }
      `)
    })
    it('should return correct ownership level and values for an expired wrapped name', async () => {
      const result = await getOwner(publicClient, {
        name: 'test.expired-wrapped.eth',
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "owner": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          "ownershipLevel": "nameWrapper",
        }
      `)
    })
  })

  describe('blockNumber', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should thread blockNumber through to the underlying eth_call', async () => {
      const blockNumber = await publicClient.getBlockNumber()
      const requestSpy = vi.spyOn(publicClient, 'request') as unknown as {
        mock: { calls: [RequestArguments][] }
      }

      const result = await getOwner(publicClient, {
        name: 'test123.eth',
        blockNumber,
      })
      expect(result).toBeTruthy()

      const ethCallInvocation = requestSpy.mock.calls.find(
        ([{ method }]) => method === 'eth_call',
      )
      expect(ethCallInvocation).toBeDefined()
      const [{ params }] = ethCallInvocation!
      expect(params?.[1]).toBe(numberToHex(blockNumber))
    })
  })
})
