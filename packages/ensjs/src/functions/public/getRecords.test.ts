import {
  deploymentAddresses,
  publicClient,
} from '../../test/addTestContracts.js'
import getRecords from './getRecords.js'

describe('getRecords()', () => {
  it('works', async () => {
    const result = await getRecords(publicClient, {
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
            "id": 60,
            "name": "ETH",
            "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          },
          {
            "id": 61,
            "name": "ETC_LEGACY",
            "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          },
          {
            "id": 0,
            "name": "BTC",
            "value": "bc1qjqg9slurvjukfl92wp58y94480fvh4uc2pwa6n",
          },
        ],
        "resolverAddress": "${deploymentAddresses.LegacyPublicResolver}",
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
