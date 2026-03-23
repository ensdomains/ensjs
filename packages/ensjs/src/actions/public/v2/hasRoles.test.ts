import { getAddress } from 'viem'
import { describe, expect, it } from 'vitest'
import {
  publicClient as client,
  deploymentAddresses,
} from '../../../test/addTestContracts.js'
import { computeResolverResource, hasRoles } from './hasRoles.js'

describe('hasRoles', () => {
  // changerole.eth is registered by owner (0x70997970...) with ROLES.ALL.
  // Then SET_RESOLVER is granted to user (0x3C44Cd...) and SET_SUBREGISTRY
  // is revoked from user.
  const owner = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  const user = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'

  describe('registry mode', () => {
    it('returns true when account has SET_SUBREGISTRY role', async () => {
      const result = await hasRoles(client, {
        registryAddress: deploymentAddresses.ETHRegistry,
        label: 'changerole',
        roles: ['ROLE_SET_SUBREGISTRY'],
        account: owner,
      })

      expect(result).toBe(true)
    })

    it('returns true when account has SET_RESOLVER role', async () => {
      const result = await hasRoles(client, {
        registryAddress: deploymentAddresses.ETHRegistry,
        label: 'changerole',
        roles: ['ROLE_SET_RESOLVER'],
        account: user,
      })

      expect(result).toBe(true)
    })

    it('returns true when account has CAN_TRANSFER_ADMIN role', async () => {
      const result = await hasRoles(client, {
        registryAddress: deploymentAddresses.ETHRegistry,
        label: 'changerole',
        roles: ['ROLE_CAN_TRANSFER_ADMIN'],
        account: owner,
      })

      expect(result).toBe(true)
    })

    it('returns true when owner has all three roles', async () => {
      const result = await hasRoles(client, {
        registryAddress: deploymentAddresses.ETHRegistry,
        label: 'changerole',
        roles: [
          'ROLE_SET_SUBREGISTRY',
          'ROLE_SET_RESOLVER',
          'ROLE_CAN_TRANSFER_ADMIN',
        ],
        account: owner,
      })

      expect(result).toBe(true)
    })

    it('returns false when account does not have the specified role', async () => {
      // user had SET_SUBREGISTRY revoked
      const result = await hasRoles(client, {
        registryAddress: deploymentAddresses.ETHRegistry,
        label: 'changerole',
        roles: ['ROLE_SET_SUBREGISTRY'],
        account: user,
      })

      expect(result).toBe(false)
    })
  })

  describe('resolver root mode', () => {
    it.todo(
      'returns true when account has root-level ROLE_SET_ALIAS',
      async () => {
        const result = await hasRoles(client, {
          resolverAddress: deploymentAddresses.PermissionedResolverImpl,
          roles: ['ROLE_SET_ALIAS'],
          account: deploymentAddresses.ETHRegistry,
        })

        expect(result).toBe(true)
      },
    )

    it.todo('returns false when account does not have root role', async () => {
      const result = await hasRoles(client, {
        resolverAddress: deploymentAddresses.PermissionedResolverImpl,
        roles: ['ROLE_SET_ALIAS'],
        account: getAddress('0x0000000000000000000000000000000000000001'),
      })

      expect(result).toBe(false)
    })
  })

  describe('resolver mode (with resource)', () => {
    it.todo('returns true when account has role for resource', async () => {
      const result = await hasRoles(client, {
        resolverAddress: deploymentAddresses.PermissionedResolverImpl,
        resource: 0n,
        roles: ['ROLE_SET_TEXT'],
        account: deploymentAddresses.PermissionedResolverImpl,
      })

      expect(result).toBe(true)
    })

    it.todo(
      'returns false when account does not have role for resource',
      async () => {
        const result = await hasRoles(client, {
          resolverAddress: deploymentAddresses.PermissionedResolverImpl,
          resource: computeResolverResource(
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ),
          roles: ['ROLE_SET_TEXT'],
          account: getAddress('0x0000000000000000000000000000000000000001'),
        })

        expect(result).toBe(false)
      },
    )
  })
})

describe('computeResolverResource', () => {
  it('computes resource from hex inputs', () => {
    const resource = computeResolverResource(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )
    expect(typeof resource).toBe('bigint')
  })
})
