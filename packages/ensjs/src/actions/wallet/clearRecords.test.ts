import type { Address, Hex } from 'viem'
import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import { getResolver } from '../public/getResolver.js'
import { getTextRecord } from '../public/getTextRecord.js'
import { clearRecords } from './clearRecords.js'
import { setTextRecord } from './setTextRecord.js'
import { deployVerifiableProxy } from './v2/deployVerifiableProxy.js'
import { setResolver } from './v2/setResolver.js'

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

it('should allow a name to be cleared', async () => {
  const resolverAddress = (await getResolver(publicClient, {
    name: 'wrapped.eth',
  }))!

  const setTextTx = await setTextRecord(walletClient, {
    name: 'wrapped.eth',
    key: 'description',
    value: 'test',
    resolverAddress,
    account: accounts[1],
  })

  expect(setTextTx).toBeTruthy()
  const setTextReceipt = await waitForTransaction(setTextTx)
  expect(setTextReceipt.status).toBe('success')

  const priorResponse = await getTextRecord(publicClient, {
    name: 'wrapped.eth',
    key: 'description',
  })
  expect(priorResponse).toBe('test')

  const tx = await clearRecords(walletClient, {
    name: 'wrapped.eth',
    resolverAddress,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const response = await getTextRecord(publicClient, {
    name: 'wrapped.eth',
    key: 'description',
  })
  expect(response).toBeNull()
})

it('should allow a name to be cleared v2', async () => {
  const proxyDeployTx = await deployVerifiableProxy(walletClient, {
    factoryAddress: deploymentAddresses.VerifiableFactory,
    implAddress: deploymentAddresses.PermissionedResolverImpl,
    account: accounts[0],
  })
  const proxyReceipt = await waitForTransaction(proxyDeployTx)
  const proxyAddress = proxyReceipt.contractAddress
  if (!proxyAddress) throw new Error('Proxy deployment failed')

  const setResolverTx = await setResolver(walletClient, {
    name: 'example.eth',
    registryAddress: deploymentAddresses.ETHRegistry,
    resolverAddress: proxyAddress,
    account: accounts[0],
  })
  await waitForTransaction(setResolverTx)

  const setTextTx = await setTextRecord(walletClient, {
    name: 'example.eth',
    key: 'description',
    value: 'test',
    resolverAddress: proxyAddress,
    account: accounts[1],
  })

  expect(setTextTx).toBeTruthy()
  const setTextReceipt = await waitForTransaction(setTextTx)
  expect(setTextReceipt.status).toBe('success')

  const priorResponse = await getTextRecord(publicClient, {
    name: 'example.eth',
    key: 'description',
  })
  expect(priorResponse).toBe('test')

  const tx = await clearRecords(walletClient, {
    resolverAddress: proxyAddress,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const response = await getTextRecord(publicClient, {
    name: 'example.eth',
    key: 'description',
  })
  expect(response).toBeNull()
})
