import { subregistryInitializeSnippet } from '@ensdomains/ensjs-abi/v2/verifiableFactory'
import type { Address } from 'viem'
import { encodeFunctionData, namehash } from 'viem'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
  waitForTransaction,
  walletClient,
} from '../../../test/addTestContracts.js'
import {
  addrPart,
  computeResolverResource,
  textPart,
} from '../../../utils/v2/roles/resolverResource.js'
import {
  RESOLVER_ROLE_SET_ADDR_ADMIN,
  RESOLVER_ROLE_SET_ALIAS_ADMIN,
  RESOLVER_ROLE_SET_TEXT_ADMIN,
} from '../../../utils/v2/roles/resolverRoles.js'
import { hasRoles } from '../../public/v2/hasRoles.js'
import { deployVerifiableProxy } from './deployVerifiableProxy.js'
import { grantResolverRoles } from './grantResolverRoles.js'
import { revokeResolverRoles } from './revokeResolverRoles.js'

// Admin roles needed to grant/revoke the corresponding non-admin roles
const ADMIN_ROLES =
  RESOLVER_ROLE_SET_TEXT_ADMIN |
  RESOLVER_ROLE_SET_ADDR_ADMIN |
  RESOLVER_ROLE_SET_ALIAS_ADMIN

let resolverProxyAddress: Address
let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClient.getAddresses()

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

describe('revokeResolverRoles', () => {
  describe('scope: root', () => {
    it('revokes root-level roles', async () => {
      // Grant first
      await waitForTransaction(
        await grantResolverRoles(walletClient, {
          resolverAddress: resolverProxyAddress,
          targetAccount: accounts[1],
          scope: 'root',
          roles: ['ROLE_SET_ALIAS'],
          account: accounts[0],
        }),
      )
      expect(
        await hasRoles(publicClient, {
          resolverAddress: resolverProxyAddress,
          roles: ['ROLE_SET_ALIAS'],
          account: accounts[1],
        }),
      ).toBe(true)

      // Revoke
      const tx = await revokeResolverRoles(walletClient, {
        resolverAddress: resolverProxyAddress,
        targetAccount: accounts[1],
        scope: 'root',
        roles: ['ROLE_SET_ALIAS'],
        account: accounts[0],
      })
      const receipt = await waitForTransaction(tx)
      expect(receipt.status).toBe('success')

      // Verify revoked
      expect(
        await hasRoles(publicClient, {
          resolverAddress: resolverProxyAddress,
          roles: ['ROLE_SET_ALIAS'],
          account: accounts[1],
        }),
      ).toBe(false)
    })
  })

  describe('scope: name', () => {
    it('revokes name-scoped roles', async () => {
      // Grant first
      await waitForTransaction(
        await grantResolverRoles(walletClient, {
          resolverAddress: resolverProxyAddress,
          targetAccount: accounts[1],
          scope: 'name',
          name: 'revoke-test.eth',
          roles: ['ROLE_SET_TEXT'],
          account: accounts[0],
        }),
      )
      const resource = computeResolverResource(
        namehash('revoke-test.eth'),
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      )
      expect(
        await hasRoles(publicClient, {
          resolverAddress: resolverProxyAddress,
          resource,
          roles: ['ROLE_SET_TEXT'],
          account: accounts[1],
        }),
      ).toBe(true)

      // Revoke
      const tx = await revokeResolverRoles(walletClient, {
        resolverAddress: resolverProxyAddress,
        targetAccount: accounts[1],
        scope: 'name',
        name: 'revoke-test.eth',
        roles: ['ROLE_SET_TEXT'],
        account: accounts[0],
      })
      const receipt = await waitForTransaction(tx)
      expect(receipt.status).toBe('success')

      // Verify revoked
      expect(
        await hasRoles(publicClient, {
          resolverAddress: resolverProxyAddress,
          resource,
          roles: ['ROLE_SET_TEXT'],
          account: accounts[1],
        }),
      ).toBe(false)
    })
  })

  describe('scope: text', () => {
    it('revokes text-key-scoped roles', async () => {
      // Grant first
      await waitForTransaction(
        await grantResolverRoles(walletClient, {
          resolverAddress: resolverProxyAddress,
          targetAccount: accounts[1],
          scope: 'text',
          name: 'revoke-test.eth',
          key: 'description',
          account: accounts[0],
        }),
      )
      const resource = computeResolverResource(
        namehash('revoke-test.eth'),
        textPart('description'),
      )
      expect(
        await hasRoles(publicClient, {
          resolverAddress: resolverProxyAddress,
          resource,
          roles: ['ROLE_SET_TEXT'],
          account: accounts[1],
        }),
      ).toBe(true)

      // Revoke
      const tx = await revokeResolverRoles(walletClient, {
        resolverAddress: resolverProxyAddress,
        targetAccount: accounts[1],
        scope: 'text',
        name: 'revoke-test.eth',
        key: 'description',
        account: accounts[0],
      })
      const receipt = await waitForTransaction(tx)
      expect(receipt.status).toBe('success')

      // Verify revoked
      expect(
        await hasRoles(publicClient, {
          resolverAddress: resolverProxyAddress,
          resource,
          roles: ['ROLE_SET_TEXT'],
          account: accounts[1],
        }),
      ).toBe(false)
    })
  })

  describe('scope: addr', () => {
    it('revokes addr-cointype-scoped roles', async () => {
      // Grant first
      await waitForTransaction(
        await grantResolverRoles(walletClient, {
          resolverAddress: resolverProxyAddress,
          targetAccount: accounts[1],
          scope: 'addr',
          name: 'revoke-test.eth',
          coinType: 60n,
          account: accounts[0],
        }),
      )
      const resource = computeResolverResource(
        namehash('revoke-test.eth'),
        addrPart(60n),
      )
      expect(
        await hasRoles(publicClient, {
          resolverAddress: resolverProxyAddress,
          resource,
          roles: ['ROLE_SET_ADDR'],
          account: accounts[1],
        }),
      ).toBe(true)

      // Revoke
      const tx = await revokeResolverRoles(walletClient, {
        resolverAddress: resolverProxyAddress,
        targetAccount: accounts[1],
        scope: 'addr',
        name: 'revoke-test.eth',
        coinType: 60n,
        account: accounts[0],
      })
      const receipt = await waitForTransaction(tx)
      expect(receipt.status).toBe('success')

      // Verify revoked
      expect(
        await hasRoles(publicClient, {
          resolverAddress: resolverProxyAddress,
          resource,
          roles: ['ROLE_SET_ADDR'],
          account: accounts[1],
        }),
      ).toBe(false)
    })
  })
})
