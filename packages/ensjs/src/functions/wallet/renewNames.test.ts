import { type Address, type Hex, labelhash } from 'viem'
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { baseRegistrarNameExpiresSnippet } from '../../contracts/baseRegistrar.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import getPrice from '../public/getPrice.js'
import getWrapperData from '../public/getWrapperData.js'
import renewNames from './renewNames.js'

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

const getExpiry = async (name: string) => {
  return publicClient.readContract({
    abi: baseRegistrarNameExpiresSnippet,
    functionName: 'nameExpires',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensBaseRegistrarImplementation',
    }),
    args: [BigInt(labelhash(name.split('.')[0]))],
  })
}

it('should return a renew transaction for a single name and succeed', async () => {
  const name = 'to-be-renewed.eth'
  const duration = 31536000n

  const oldExpiry = await getExpiry(name)

  const price = await getPrice(publicClient, {
    nameOrNames: name,
    duration,
  })
  const total = price!.base + price!.premium

  const tx = await renewNames(walletClient, {
    nameOrNames: name,
    duration,
    value: total,
    account: accounts[0],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const newExpiry = await getExpiry(name)
  expect(newExpiry).toBe(oldExpiry + duration)
})

it('should return a renewAll transaction for multiple names and succeed', async () => {
  const names = ['to-be-renewed.eth', 'test123.eth']
  const duration = 31536000n

  const oldExpiries = await Promise.all(names.map(getExpiry))

  const price = await getPrice(publicClient, {
    nameOrNames: names,
    duration,
  })
  const total = price!.base + price!.premium

  const tx = await renewNames(walletClient, {
    nameOrNames: names,
    duration,
    value: total,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const newExpiries = await Promise.all(names.map(getExpiry))
  for (let i = 0; i < names.length; i += 1) {
    expect(newExpiries[i]).toBe(oldExpiries[i] + duration)
  }
})

// TODO: Enable when test environment deploys new contracts with referrer support
it.skip('should include referrer when renewing unwrapped names', async () => {
  const name = 'to-be-renewed.eth'
  const duration = 31536000n
  const referrer =
    '0x000000000000000000000000000000000000000000000000000000000000dead' as Hex

  const price = await getPrice(publicClient, {
    nameOrNames: name,
    duration,
  })
  const total = price!.base + price!.premium

  const tx = await renewNames(walletClient, {
    nameOrNames: name,
    duration,
    value: total,
    referrer,
    account: accounts[0],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')
})

// TODO: Enable when test environment deploys new contracts
it.skip('should auto-detect wrapped names when containsWrappedNames is not provided', async () => {
  // Use a name that's actually wrapped in the test environment
  const name = 'wrapped-with-subnames.eth'
  const duration = 31536000n

  const price = await getPrice(publicClient, {
    nameOrNames: name,
    duration,
  })
  const total = price!.base + price!.premium

  // First, verify the name is actually wrapped
  const wrapperData = await getWrapperData(publicClient, { name })
  expect(wrapperData).toBeTruthy()
  expect(wrapperData?.owner).not.toBe(
    '0x0000000000000000000000000000000000000000',
  )

  // Spy on makeFunctionData to verify it's called with containsWrappedNames: true
  const originalMakeFunctionData = renewNames.makeFunctionData
  let actualContainsWrappedNames: boolean | undefined
  renewNames.makeFunctionData = vi.fn((wallet, params) => {
    actualContainsWrappedNames = params.containsWrappedNames
    return originalMakeFunctionData(wallet, params)
  })

  // Don't provide containsWrappedNames - it should auto-detect as true
  const tx = await renewNames(walletClient, {
    nameOrNames: name,
    duration,
    value: total,
    account: accounts[0],
  })

  // Verify auto-detection set containsWrappedNames to true
  expect(actualContainsWrappedNames).toBe(true)

  // Restore original function
  renewNames.makeFunctionData = originalMakeFunctionData

  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')
})

// TODO: Enable when test environment deploys new contracts
it.skip('should auto-detect unwrapped names when containsWrappedNames is not provided', async () => {
  // Use a name that's NOT wrapped in the test environment
  const name = 'to-be-renewed.eth'
  const duration = 31536000n

  const price = await getPrice(publicClient, {
    nameOrNames: name,
    duration,
  })
  const total = price!.base + price!.premium

  // First, verify the name is NOT wrapped
  const wrapperData = await getWrapperData(publicClient, { name })
  expect(wrapperData).toBeNull()

  // Spy on makeFunctionData to verify it's called with containsWrappedNames: false
  const originalMakeFunctionData = renewNames.makeFunctionData
  let actualContainsWrappedNames: boolean | undefined
  renewNames.makeFunctionData = vi.fn((wallet, params) => {
    actualContainsWrappedNames = params.containsWrappedNames
    return originalMakeFunctionData(wallet, params)
  })

  // Don't provide containsWrappedNames - it should auto-detect as false
  const tx = await renewNames(walletClient, {
    nameOrNames: name,
    duration,
    value: total,
    account: accounts[0],
  })

  // Verify auto-detection set containsWrappedNames to false
  expect(actualContainsWrappedNames).toBe(false)

  // Restore original function
  renewNames.makeFunctionData = originalMakeFunctionData

  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')
})

it('should throw error when referrer is provided for wrapped names', async () => {
  const name = 'wrapped-with-subnames.eth'
  const duration = 31536000n
  const referrer =
    '0x000000000000000000000000000000000000000000000000000000000000dead' as Hex

  const price = await getPrice(publicClient, {
    nameOrNames: name,
    duration,
  })
  const total = price!.base + price!.premium

  // Verify the name is actually wrapped
  const wrapperData = await getWrapperData(publicClient, { name })
  expect(wrapperData).toBeTruthy()

  await expect(
    renewNames(walletClient, {
      nameOrNames: name,
      duration,
      value: total,
      containsWrappedNames: true,
      referrer,
      account: accounts[0],
    }),
  ).rejects.toThrow('referrer cannot be specified when renewing wrapped names')
})
