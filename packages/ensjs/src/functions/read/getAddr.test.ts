import { publicClient } from '../../tests/addTestContracts'
import getAddr from './getAddr'

describe('getAddr()', () => {
  it('returns the ETH record when no coin is provided', async () => {
    const result = await getAddr(publicClient, { name: 'with-profile.eth' })
    expect(result).toMatchInlineSnapshot(`
      {
        "id": 60,
        "name": "ETH",
        "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      }
    `)
  })
  it('should return the correct address based on a coin ID input as a number', async () => {
    const result = await getAddr(publicClient, {
      name: 'with-profile.eth',
      coin: 61,
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "id": 61,
        "name": "ETC_LEGACY",
        "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      }
    `)
  })
  it('should return the correct address based on a coin ID input as a string', async () => {
    const result = await getAddr(publicClient, {
      name: 'with-profile.eth',
      coin: '61',
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "id": 61,
        "name": "ETC_LEGACY",
        "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      }
    `)
  })
  it('should return the correct address based on a coin name', async () => {
    const result = await getAddr(publicClient, {
      name: 'with-profile.eth',
      coin: 'ETC_LEGACY',
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "id": 61,
        "name": "ETC_LEGACY",
        "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      }
    `)
  })
  it('should return null for a non-existent coin', async () => {
    const result = await getAddr(publicClient, {
      name: 'with-profile.eth',
      coin: 'BNB',
    })
    expect(result).toBeNull()
  })
})
