import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '../../index.js'
import {
  deploymentAddresses,
  publicClient,
} from '../../test/addTestContracts.js'
import getRecords from './getRecords.js'

const mainnetPublicClient = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http('https://web3.ens.domains/v1/mainnet'),
})

describe('getRecords()', () => {
  it('works', async () => {
    const result = await getRecords(publicClient, {
      name: 'with-profile.eth',
      records: {
        texts: ['description', 'url'],
        coins: ['60', 'etcLegacy', '0'],
      },
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coins": [
          {
            "id": 60,
            "name": "eth",
            "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          },
          {
            "id": 61,
            "name": "etcLegacy",
            "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          },
          {
            "id": 0,
            "name": "btc",
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
  it('works with oldest resolver', async () => {
    const result = await getRecords(publicClient, {
      name: 'with-oldest-resolver.eth',
      records: {
        texts: ['description', 'url'],
        coins: ['60', 'etcLegacy', '0'],
      },
    })
    expect(result).toMatchInlineSnapshot(`
    {
      "coins": [
        {
          "id": 60,
          "name": "eth",
          "value": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        },
      ],
      "resolverAddress": "${deploymentAddresses.OldestResolver}",
      "texts": [],
    }
  `)
  })
  it('works with oldest resolver - jessesum.eth', async () => {
    const result = await getRecords(mainnetPublicClient, {
      name: 'jessesum.eth',
      records: {
        texts: ['description', 'url'],
        coins: ['60', 'etcLegacy', '0'],
      },
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coins": [
          {
            "id": 60,
            "name": "eth",
            "value": "0x8c4Eb6988A199DAbcae0Ce31052b3f3aC591787e",
          },
        ],
        "resolverAddress": "0x1da022710dF5002339274AaDEe8D58218e9D6AB5",
        "texts": [],
      }
    `)
  })
})
