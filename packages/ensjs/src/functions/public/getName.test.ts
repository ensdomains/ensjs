import type { Address, Hex } from 'viem'
import {
  deploymentAddresses,
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../tests/addTestContracts.js'
import setPrimaryName from '../wallet/setPrimaryName.js'
import getName from './getName.js'

let snapshot: Hex
let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClient.getAddresses()
})

beforeEach(async () => {
  snapshot = await testClient.snapshot()
})

afterEach(async () => {
  await testClient.revert({ id: snapshot })
})

describe('getName', () => {
  it('should get a primary name from an address', async () => {
    const result = await getName(publicClient, {
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "match": true,
        "name": "with-profile.eth",
        "resolverAddress": "${deploymentAddresses.LegacyPublicResolver}",
        "reverseResolverAddress": "${deploymentAddresses.PublicResolver}",
      }
    `)
  })
  it('should return null for an address with no primary name', async () => {
    const result = await getName(publicClient, {
      address: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
    })
    expect(result).toBeNull()
  })
  it('should return with a false match for a name with no forward resolution', async () => {
    const tx = await setPrimaryName(walletClient, {
      name: 'with-profile.eth',
      account: accounts[0],
    })
    await waitForTransaction(tx)

    const result = await getName(publicClient, {
      address: accounts[0],
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "match": false,
        "name": "with-profile.eth",
        "resolverAddress": "${deploymentAddresses.LegacyPublicResolver}",
        "reverseResolverAddress": "${deploymentAddresses.PublicResolver}",
      }
    `)
  })
})
