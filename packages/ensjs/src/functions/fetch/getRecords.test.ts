import { testClient } from '../../tests/addTestContracts'
import getRecords from './getRecords'

describe('getRecords()', () => {
  it('works', async () => {
    const result = await getRecords(testClient, {
      name: 'with-profile.eth',
      records: {
        texts: ['description', 'url'],
        coins: ['60', 'ETC_LEGACY', '0'],
      },
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coins": [
          {
            "addr": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            "id": 60,
            "name": "ETH",
          },
          {
            "addr": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            "id": 61,
            "name": "ETC_LEGACY",
          },
          {
            "addr": "bc1qjqg9slurvjukfl92wp58y94480fvh4uc2pwa6n",
            "id": 0,
            "name": "BTC",
          },
        ],
        "resolverAddress": "0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB",
        "texts": [
          {
            "key": "description",
            "value": "Hello2",
          },
          {
            "key": "url",
            "value": "twitter.com",
          },
        ],
      }
    `)
  })
})
