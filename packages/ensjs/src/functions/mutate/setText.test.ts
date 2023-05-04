import { Address, Hex } from 'viem'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../tests/addTestContracts'
import getResolver from '../fetch/getResolver'
import getText from '../fetch/getText'
import setText from './setText'

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

it('should allow a text record to be set', async () => {
  const tx = await setText(walletClient, {
    name: 'test123.eth',
    key: 'foo',
    value: 'bar',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const response = await getText(publicClient, {
    name: 'test123.eth',
    key: 'foo',
  })
  expect(response).toBe('bar')
})

it('should allow a text record to be set to blank', async () => {
  const tx = await setText(walletClient, {
    name: 'test123.eth',
    key: 'url',
    value: null,
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const response = await getText(publicClient, {
    name: 'test123.eth',
    key: 'url',
  })
  expect(response).toBeNull()
})
