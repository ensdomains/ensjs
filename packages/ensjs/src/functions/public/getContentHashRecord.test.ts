import { publicClient } from '../../test/addTestContracts.js'
import getContentHashRecord from './getContentHashRecord.js'

describe('getContentHashRecord', () => {
  it('should return null for a non-existent name', async () => {
    const result = await getContentHashRecord(publicClient, {
      name: 'test123123cool.eth',
    })
    expect(result).toBeNull()
  })
  it('should return null for a name with no contenthash record', async () => {
    const result = await getContentHashRecord(publicClient, {
      name: 'with-profile.eth',
    })
    expect(result).toBeNull()
  })
  it('should return the contenthash for a name with the record set', async () => {
    const result = await getContentHashRecord(publicClient, {
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
