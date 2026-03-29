import type { Address } from 'viem'
import { encodeFunctionData, encodePacked, keccak256, namehash } from 'viem'
import { beforeAll, describe, expect, it } from 'vitest'
import { subregistryInitializeSnippet } from '../../../contracts/verifiableFactory.js'
import {
  deploymentAddresses,
  publicClient,
  waitForTransaction,
  walletClient,
} from '../../../test/addTestContracts.js'
import {
  RESOLVER_ROLE_SET_ADDR_ADMIN,
  RESOLVER_ROLE_SET_ALIAS_ADMIN,
  RESOLVER_ROLE_SET_TEXT_ADMIN,
} from '../../../utils/v2/roles/resolverRoles.js'
import { computeResolverResource, hasRoles } from '../../public/v2/hasRoles.js'
import { deployVerifiableProxy } from './deployVerifiableProxy.js'
import { grantResolverRoles } from './grantResolverRoles.js'

// Admin roles needed to grant the corresponding non-admin roles to other accounts
const ADMIN_ROLES =
  RESOLVER_ROLE_SET_TEXT_ADMIN |
  RESOLVER_ROLE_SET_ADDR_ADMIN |
  RESOLVER_ROLE_SET_ALIAS_ADMIN

let resolverProxyAddress: Address
let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClient.getAddresses()

  // Deploy a fresh PermissionedResolver proxy with admin roles for accounts[0]
  const proxyDeployTx = await deployVerifiableProxy(walletClient, {
    factoryAddress: deploymentAddresses.VerifiableFactory,
    implAddress: deploymentAddresses.PermissionedResolverImpl,
    callData: encodeFunctionData({
      abi: subregistryInitializeSnippet,
      functionName: 'initialize',
      args: [accounts[0], ADMIN_ROLES],
    }),
    account: accounts[0],
  })
  const proxyReceipt = await waitForTransaction(proxyDeployTx)
  resolverProxyAddress =
    `0x${proxyReceipt.logs[3].topics[2]?.slice(26)}` as Address
})

describe('grantResolverRoles', () => {
  describe('scope: root', () => {
    it('grants root-level roles', async () => {
      const tx = await grantResolverRoles(walletClient, {
        resolverAddress: resolverProxyAddress,
        targetAccount: accounts[1],
        scope: 'root',
        roles: ['ROLE_SET_ALIAS'],
        account: accounts[0],
      })
      const receipt = await waitForTransaction(tx)
      expect(receipt.status).toBe('success')

      const result = await hasRoles(publicClient, {
        resolverAddress: resolverProxyAddress,
        roles: ['ROLE_SET_ALIAS'],
        account: accounts[1],
      })
      expect(result).toBe(true)
    })
  })

  describe('scope: name', () => {
    it('grants name-scoped roles', async () => {
      const tx = await grantResolverRoles(walletClient, {
        resolverAddress: resolverProxyAddress,
        targetAccount: accounts[1],
        scope: 'name',
        name: 'test.eth',
        roles: ['ROLE_SET_TEXT'],
        account: accounts[0],
      })
      const receipt = await waitForTransaction(tx)
      expect(receipt.status).toBe('success')

      const resource = computeResolverResource(
        namehash('test.eth'),
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      )
      const result = await hasRoles(publicClient, {
        resolverAddress: resolverProxyAddress,
        resource,
        roles: ['ROLE_SET_TEXT'],
        account: accounts[1],
      })
      expect(result).toBe(true)
    })
  })

  describe('scope: text', () => {
    it('grants text-key-scoped roles', async () => {
      const tx = await grantResolverRoles(walletClient, {
        resolverAddress: resolverProxyAddress,
        targetAccount: accounts[1],
        scope: 'text',
        name: 'test.eth',
        key: 'avatar',
        account: accounts[0],
      })
      const receipt = await waitForTransaction(tx)
      expect(receipt.status).toBe('success')

      // textPart(key) = keccak256(abi.encodePacked(uint8(2), keccak256(key)))
      const keyHash = keccak256(new TextEncoder().encode('avatar'))
      const textPart = keccak256(
        encodePacked(['uint8', 'bytes32'], [2, keyHash]),
      )
      const resource = computeResolverResource(namehash('test.eth'), textPart)
      const result = await hasRoles(publicClient, {
        resolverAddress: resolverProxyAddress,
        resource,
        roles: ['ROLE_SET_TEXT'],
        account: accounts[1],
      })
      expect(result).toBe(true)
    })
  })

  describe('scope: addr', () => {
    it('grants addr-cointype-scoped roles', async () => {
      const tx = await grantResolverRoles(walletClient, {
        resolverAddress: resolverProxyAddress,
        targetAccount: accounts[1],
        scope: 'addr',
        name: 'test.eth',
        coinType: 60n,
        account: accounts[0],
      })
      const receipt = await waitForTransaction(tx)
      expect(receipt.status).toBe('success')

      // addrPart(coinType) = keccak256(abi.encodePacked(uint8(1), coinType))
      const addrPart = keccak256(encodePacked(['uint8', 'uint256'], [1, 60n]))
      const resource = computeResolverResource(namehash('test.eth'), addrPart)
      const result = await hasRoles(publicClient, {
        resolverAddress: resolverProxyAddress,
        resource,
        roles: ['ROLE_SET_ADDR'],
        account: accounts[1],
      })
      expect(result).toBe(true)
    })
  })
})
