import type { Address, Hex } from 'viem'
import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import { getResolver } from '../public/getResolver.js'
import { getTextRecord } from '../public/getTextRecord.js'
import { setTextRecord } from './setTextRecord.js'

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
  const tx = await setTextRecord(walletClient, {
    name: 'with-subnames.eth',
    key: 'foo',
    value: 'bar',
    resolverAddress: (await getResolver(publicClient, {
      name: 'with-subnames.eth',
    }))!,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const response = await getTextRecord(publicClient, {
    name: 'with-subnames.eth',
    key: 'foo',
  })
  expect(response).toBe('bar')
})

it('should allow a text record to be set to blank', async () => {
  const tx = await setTextRecord(walletClient, {
    name: 'with-subnames.eth',
    key: 'url',
    value: null,
    resolverAddress: (await getResolver(publicClient, {
      name: 'with-subnames.eth',
    }))!,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const response = await getTextRecord(publicClient, {
    name: 'with-subnames.eth',
    key: 'url',
  })
  expect(response).toBeNull()
})
