import { testClient } from '../../tests/addTestContracts'
import getContentHash from './getContentHash'

describe('getContentHash', () => {
  it('should return null for a non-existent name', async () => {
    const result = await getContentHash(testClient, {
      name: 'test123123cool.eth',
    })
    expect(result).toBeNull()
  })
  it('should return null for a name with no contenthash record', async () => {
    const result = await getContentHash(testClient, {
      name: 'with-profile.eth',
    })
    expect(result).toBeNull()
  })
  it('should return the contenthash for a name with the record set', async () => {
    const result = await getContentHash(testClient, {
      name: 'with-contenthash.eth',
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "decoded": "bafybeico3uuyj3vphxpvbowchdwjlrlrh62awxscrnii7w7flu5z6fk77y",
        "protocolType": "ipfs",
      }
    `)
  })
})
