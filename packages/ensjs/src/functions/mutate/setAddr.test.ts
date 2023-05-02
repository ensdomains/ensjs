import { Address, Hex } from 'viem'
import {
  publicClient,
  testClient,
  walletClient,
} from '../../tests/addTestContracts'
import getAddr from '../fetch/getAddr'
import getResolver from '../fetch/getResolver'
import setAddr from './setAddr'

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

it('should allow an eth address record to be set', async () => {
  const tx = await setAddr(walletClient, {
    name: 'test123.eth',
    coin: 'ETH',
    address: '0x42D63ae25990889E35F215bC95884039Ba354115',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx })
  expect(receipt.status).toBe('success')

  const response = await getAddr(publicClient, {
    name: 'test123.eth',
    coin: 'ETH',
  })
  expect(response).toMatchInlineSnapshot(`
    {
      "addr": "0x42D63ae25990889E35F215bC95884039Ba354115",
      "id": 60,
      "name": "ETH",
    }
  `)
})

it('should allow a multicoin address record to be set', async () => {
  const tx = await setAddr(walletClient, {
    name: 'test123.eth',
    coin: 'ETC_LEGACY',
    address: '0x42D63ae25990889E35F215bC95884039Ba354115',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx })
  expect(receipt.status).toBe('success')

  const response = await getAddr(publicClient, {
    name: 'test123.eth',
    coin: 'ETC_LEGACY',
  })
  expect(response).toMatchInlineSnapshot(`
    {
      "addr": "0x42D63ae25990889E35F215bC95884039Ba354115",
      "id": 61,
      "name": "ETC_LEGACY",
    }
  `)
})

it('should allow an eth record to be set to blank', async () => {
  const tx = await setAddr(walletClient, {
    name: 'test123.eth',
    coin: 'ETH',
    address: null,
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx })
  expect(receipt.status).toBe('success')

  const response = await getAddr(publicClient, {
    name: 'test123.eth',
    coin: 'ETH',
  })
  expect(response).toBeNull()
})

it('should allow a multicoin record to be set to blank', async () => {
  const tx = await setAddr(walletClient, {
    name: 'with-profile.eth',
    coin: 'BTC',
    address: null,
    resolverAddress: (await getResolver(publicClient, {
      name: 'with-profile.eth',
    }))!,
    account: accounts[2],
  })
  expect(tx).toBeTruthy()
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx })
  expect(receipt.status).toBe('success')

  const response = await getAddr(publicClient, {
    name: 'with-profile.eth',
    coin: 'BTC',
  })
  expect(response).toBeNull()
})
