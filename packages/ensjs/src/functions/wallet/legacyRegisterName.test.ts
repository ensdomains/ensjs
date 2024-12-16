import type { Address, Hex } from 'viem'
import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import type { RegistrationParameters } from '../../utils/registerHelpers.js'
import getPrice from '../public/getPrice.js'
import legacyCommitName from './legacyCommitName.js'
import legacyRegisterName from './legacyRegisterName.js'
import getOwner from '../public/getOwner.js'

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

const secret = `0x${'a'.repeat(64)}` as Hex

it.only('should return a registration transaction and succeed', async () => {
  const params: RegistrationParameters = {
    name: 'cool-swag.eth',
    duration: 31536000,
    owner: accounts[1],
    secret,
  }
  const commitTx = await legacyCommitName(walletClient, {
    ...params,
    account: accounts[1],
  })
  expect(commitTx).toBeTruthy()
  const commitReceipt = await waitForTransaction(commitTx)

  expect(commitReceipt.status).toBe('success')

  await testClient.increaseTime({ seconds: 61 })
  await testClient.mine({ blocks: 1 })

  const price = await getPrice(publicClient, {
    nameOrNames: params.name,
    duration: params.duration,
  })
  const total = price!.base + price!.premium

  const tx = await legacyRegisterName(walletClient, {
    ...params,
    account: accounts[1],
    value: total,
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getOwner(publicClient, { name: params.name })
  expect(owner?.registrant).toBe(accounts[1])
})
