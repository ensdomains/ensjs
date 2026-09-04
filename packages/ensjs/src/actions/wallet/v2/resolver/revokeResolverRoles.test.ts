import type { Address } from 'viem'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
  waitForTransaction,
  walletClient,
} from '../../../../test/addTestContracts.js'
import { computeResolverResource } from '../../../../utils/v2/roles/resolverResource.js'
import {
  RESOLVER_ROLE_LINK_ADMIN,
  RESOLVER_ROLE_SET_ADDRESS_ADMIN,
  RESOLVER_ROLE_SET_TEXT_ADMIN,
} from '../../../../utils/v2/roles/resolverRoles.js'
import { hasRoles } from '../../../public/v2/accessControl/hasRoles.js'
import { deployPermissionedResolver } from '../verifiableFactory/deployPermissionedResolver.js'
import { grantResolverRoles } from './grantResolverRoles.js'
import { revokeResolverRoles } from './revokeResolverRoles.js'

// Needs the post-audit-2 PermissionedResolverImpl on the devnet.

const ADMIN_ROLES =
  RESOLVER_ROLE_SET_TEXT_ADMIN |
  RESOLVER_ROLE_SET_ADDRESS_ADMIN |
  RESOLVER_ROLE_LINK_ADMIN

let resolverProxyAddress: Address
let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClient.getAddresses()

  const proxyDeployTx = await deployPermissionedResolver(walletClient, {
    factoryAddress: deploymentAddresses.VerifiableFactory,
    implAddress: deploymentAddresses.PermissionedResolverImpl,
    grants: [{ account: accounts[0], roleBitmap: ADMIN_ROLES }],
    account: accounts[0],
  })
  const proxyReceipt = await waitForTransaction(proxyDeployTx)
  resolverProxyAddress =
    `0x${proxyReceipt.logs[3].topics[2]?.slice(26)}` as Address
})

describe('revokeResolverRoles', () => {
  describe('scope: root', () => {
    it('revokes root-level roles', async () => {
      await waitForTransaction(
        await grantResolverRoles(walletClient, {
          resolverAddress: resolverProxyAddress,
          targetAccount: accounts[1],
          scope: 'root',
          roles: ['ROLE_LINK'],
          account: accounts[0],
        }),
      )
      expect(
        await hasRoles(publicClient, {
          resolverAddress: resolverProxyAddress,
          roles: ['ROLE_LINK'],
          account: accounts[1],
        }),
      ).toBe(true)

      const tx = await revokeResolverRoles(walletClient, {
        resolverAddress: resolverProxyAddress,
        targetAccount: accounts[1],
        scope: 'root',
        roles: ['ROLE_LINK'],
        account: accounts[0],
      })
      const receipt = await waitForTransaction(tx)
      expect(receipt.status).toBe('success')

      expect(
        await hasRoles(publicClient, {
          resolverAddress: resolverProxyAddress,
          roles: ['ROLE_LINK'],
          account: accounts[1],
        }),
      ).toBe(false)
    })
  })

  describe('scope: setter', () => {
    it('revokes a text-key-scoped role', async () => {
      const setter = { kind: 'text', key: 'avatar' } as const
      await waitForTransaction(
        await grantResolverRoles(walletClient, {
          resolverAddress: resolverProxyAddress,
          targetAccount: accounts[1],
          scope: 'setter',
          setter,
          account: accounts[0],
        }),
      )

      const tx = await revokeResolverRoles(walletClient, {
        resolverAddress: resolverProxyAddress,
        targetAccount: accounts[1],
        scope: 'setter',
        setter,
        account: accounts[0],
      })
      const receipt = await waitForTransaction(tx)
      expect(receipt.status).toBe('success')

      expect(
        await hasRoles(publicClient, {
          resolverAddress: resolverProxyAddress,
          resource: computeResolverResource(setter),
          roles: ['ROLE_SET_TEXT'],
          account: accounts[1],
        }),
      ).toBe(false)
    })
  })

  describe('scope: resource', () => {
    it('revokes on a raw resource', async () => {
      const setter = { kind: 'address', coinType: 60n } as const
      await waitForTransaction(
        await grantResolverRoles(walletClient, {
          resolverAddress: resolverProxyAddress,
          targetAccount: accounts[1],
          scope: 'setter',
          setter,
          account: accounts[0],
        }),
      )

      const tx = await revokeResolverRoles(walletClient, {
        resolverAddress: resolverProxyAddress,
        targetAccount: accounts[1],
        scope: 'resource',
        resource: computeResolverResource(setter),
        roles: ['ROLE_SET_ADDRESS'],
        account: accounts[0],
      })
      const receipt = await waitForTransaction(tx)
      expect(receipt.status).toBe('success')

      expect(
        await hasRoles(publicClient, {
          resolverAddress: resolverProxyAddress,
          resource: computeResolverResource(setter),
          roles: ['ROLE_SET_ADDRESS'],
          account: accounts[1],
        }),
      ).toBe(false)
    })
  })
})
