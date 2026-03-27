import { encodeFunctionData, namehash } from 'viem'
import { expect, it } from 'vitest'
import { publicResolverTextSnippet } from '../../../contracts/publicResolver.js'
import { subregistryInitializeSnippet } from '../../../contracts/verifiableFactory.js'
import {
  deploymentAddresses,
  publicClient,
  waitForTransaction,
  walletClient,
} from '../../../test/addTestContracts.js'
import {
  RESOLVER_ROLE_CLEAR,
  RESOLVER_ROLE_SET_ABI,
  RESOLVER_ROLE_SET_ADDR,
  RESOLVER_ROLE_SET_ALIAS,
  RESOLVER_ROLE_SET_CONTENTHASH,
  RESOLVER_ROLE_SET_INTERFACE,
  RESOLVER_ROLE_SET_NAME,
  RESOLVER_ROLE_SET_PUBKEY,
  RESOLVER_ROLE_SET_TEXT,
} from '../../../utils/v2/roles/resolverRoles.js'
import { setTextRecord } from '../setTextRecord.js'
import { clearRecords } from './clearRecords.js'
import { deployVerifiableProxy } from './deployVerifiableProxy.js'

const RESOLVER_ROLES_ALL =
  RESOLVER_ROLE_SET_ADDR |
  RESOLVER_ROLE_SET_TEXT |
  RESOLVER_ROLE_SET_CONTENTHASH |
  RESOLVER_ROLE_SET_PUBKEY |
  RESOLVER_ROLE_SET_ABI |
  RESOLVER_ROLE_SET_INTERFACE |
  RESOLVER_ROLE_SET_NAME |
  RESOLVER_ROLE_SET_ALIAS |
  RESOLVER_ROLE_CLEAR

it('should allow a name to be cleared v2', async () => {
  const accounts = await walletClient.getAddresses()
  const proxyDeployTx = await deployVerifiableProxy(walletClient, {
    factoryAddress: deploymentAddresses.VerifiableFactory,
    implAddress: deploymentAddresses.PermissionedResolverImpl,
    callData: encodeFunctionData({
      abi: subregistryInitializeSnippet,
      functionName: 'initialize',
      args: [accounts[1], RESOLVER_ROLES_ALL],
    }),
    account: accounts[0],
  })
  const proxyReceipt = await waitForTransaction(proxyDeployTx)
  const resolverProxyAddress =
    `0x${proxyReceipt.logs[3].topics[2]?.slice(26)}` as const

  const setRecordTx = await setTextRecord(walletClient, {
    resolverAddress: resolverProxyAddress,
    account: accounts[1],
    key: 'description',
    value: 'test',
    name: 'test.eth',
  })

  let receipt = await waitForTransaction(setRecordTx)
  expect(receipt.status).toBe('success')

  const tx = await clearRecords(walletClient, {
    name: 'test.eth',
    resolverAddress: resolverProxyAddress,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const description = await publicClient.readContract({
    address: resolverProxyAddress,
    abi: publicResolverTextSnippet,
    functionName: 'text',
    args: [namehash('test.eth'), 'description'],
  })
  expect(description).toBe('')
})
