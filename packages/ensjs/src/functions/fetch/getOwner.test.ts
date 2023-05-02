import { publicClient } from '../../tests/addTestContracts'
import getOwner from './getOwner'

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
        "owner": "0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E",
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
})
