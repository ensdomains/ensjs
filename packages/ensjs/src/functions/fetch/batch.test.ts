import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addContracts } from '../../contracts/addContracts'
import { publicClient } from '../../tests/addTestContracts'
import batch from './batch'
import getAddr from './getAddr'
import getName from './getName'
import getText from './getText'

const [mainnetWithEns] = addContracts([mainnet])
const transport = http('https://web3.ens.domains/v1/mainnet')

const mainnetPublicClient = createPublicClient({
  chain: mainnetWithEns,
  transport,
})

describe('batch', () => {
  it('should batch calls together', async () => {
    const result = await batch(
      publicClient,
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
      publicClient,
      getText.batch({ name: 'with-profile.eth', key: 'description' }),
    )
    expect(result).toMatchInlineSnapshot(`
      [
        "Hello2",
      ]
    `)
  })
  it('should batch ccip', async () => {
    const result = await batch(
      mainnetPublicClient,
      getText.batch({ name: '1.offchainexample.eth', key: 'email' }),
      getText.batch({ name: '2.offchainexample.eth', key: 'email' }),
    )
    expect(result).toMatchInlineSnapshot(`
      [
        "nick@ens.domains",
        "nick@ens.domains",
      ]
    `)
  })
})
