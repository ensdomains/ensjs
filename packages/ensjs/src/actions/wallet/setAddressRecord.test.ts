import type { Address, Hex } from 'viem'
import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import { getAddressRecord } from '../public/getAddressRecord.js'
import { getResolver } from '../public/getResolver.js'
import { setAddressRecord } from './setAddressRecord.js'

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
  const tx = await setAddressRecord(walletClient, {
    name: 'test123.eth',
    coin: 'eth',
    value: '0x42D63ae25990889E35F215bC95884039Ba354115',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const response = await getAddressRecord(publicClient, {
    name: 'test123.eth',
    coin: 'eth',
  })
  expect(response).toMatchInlineSnapshot(`
    {
      "coinType": 60,
      "symbol": "eth",
      "value": "0x42D63ae25990889E35F215bC95884039Ba354115",
    }
  `)
})

it('should allow a multicoin address record to be set', async () => {
  const tx = await setAddressRecord(walletClient, {
    name: 'test123.eth',
    coin: 'etcLegacy',
    value: '0x42D63ae25990889E35F215bC95884039Ba354115',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const response = await getAddressRecord(publicClient, {
    name: 'test123.eth',
    coin: 'etcLegacy',
  })
  expect(response).toMatchInlineSnapshot(`
    {
      "coinType": 61,
      "symbol": "etcLegacy",
      "value": "0x42D63ae25990889E35F215bC95884039Ba354115",
    }
  `)
})

it('should allow an eth record to be set to blank', async () => {
  const tx = await setAddressRecord(walletClient, {
    name: 'test123.eth',
    coin: 'eth',
    value: null,
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const response = await getAddressRecord(publicClient, {
    name: 'test123.eth',
    coin: 'eth',
  })
  expect(response).toBeNull()
})

it('should allow a multicoin record to be set to blank', async () => {
  const tx = await setAddressRecord(walletClient, {
    name: 'with-profile.eth',
    coin: 'btc',
    value: null,
    resolverAddress: (await getResolver(publicClient, {
      name: 'with-profile.eth',
    }))!,
    account: accounts[2],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const response = await getAddressRecord(publicClient, {
    name: 'with-profile.eth',
    coin: 'btc',
  })
  expect(response).toBeNull()
})

// it('uses DedicatedResolver if namehash is not provided', async () => {
//  const tx = await setResolver(walletClient, {
//   name: 'test123.eth',
//   contract: 'registry',
//   resolverAddress: deploymentAddresses.DedicatedResolver,
//   account: accounts[1],
// })
// there will be a test that sets the name to DedicatedResolver and then sets a record, but tenv does not include Namechain stuff yet
// })
