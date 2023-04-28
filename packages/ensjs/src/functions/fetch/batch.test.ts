import { testClient } from '../../tests/addTestContracts'
import batch from './batch'
import getAddr from './getAddr'
import getName from './getName'
import getText from './getText'

describe('batch', () => {
  it('should batch calls together', async () => {
    const result = await batch(
      testClient,
      getText.batch({ name: 'with-profile.eth', key: 'description' }),
      getAddr.batch({ name: 'with-profile.eth' }),
      getName.batch({ address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' }),
    )
    expect(result).toMatchInlineSnapshot(`
      [
        "Hello2",
        {
          "addr": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          "id": 60,
          "name": "ETH",
        },
        {
          "match": true,
          "name": "with-profile.eth",
          "resolverAddress": "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB",
          "reverseResolverAddress": "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49",
        },
      ]
    `)
  })
  it('should batch a single call', async () => {
    const result = await batch(
      testClient,
      getText.batch({ name: 'with-profile.eth', key: 'description' }),
    )
    expect(result).toMatchInlineSnapshot(`
      [
        "Hello2",
      ]
    `)
  })
})
