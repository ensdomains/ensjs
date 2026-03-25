import type { Address } from 'viem'
import { encodeFunctionData, getAddress, keccak256 } from 'viem'
import { beforeAll, describe, expect, it } from 'vitest'
import { verifiableFactoryDeployProxySnippet } from '../../../contracts/verifiableFactory.js'
import {
  publicClient as client,
  deploymentAddresses,
  waitForTransaction,
  walletClient,
} from '../../../test/addTestContracts.js'
import { computeResolverResource, hasRoles } from './hasRoles.js'

const RESOLVER_ROLES_ALL =
  0x1111111111111111111111111111111111111111111111111111111111111111n

let resolverProxyAddress: `0x${string}` | undefined
let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClient.getAddresses()
  const proxyDeployTx = await walletClient.writeContract({
    address: deploymentAddresses.VerifiableFactory,
    abi: verifiableFactoryDeployProxySnippet,
    functionName: 'deployProxy',
    args: [
      deploymentAddresses.PermissionedResolverImpl,
      BigInt(
        keccak256(
          new TextEncoder().encode(`resolver-roles-test-${Date.now()}`),
        ),
      ),
      encodeFunctionData({
        abi: [
          {
            type: 'function',
            inputs: [
              { name: 'admin', type: 'address' },
              { name: 'roleBitmap', type: 'uint256' },
            ],
            name: 'initialize',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        functionName: 'initialize',
        args: [accounts[0], RESOLVER_ROLES_ALL],
      }),
    ],
    account: accounts[0],
  })
  const proxyReceipt = await waitForTransaction(proxyDeployTx)
  resolverProxyAddress = `0x${proxyReceipt.logs[3].topics[2].slice(26)}`
})

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
    it('returns true when account has root-level ROLE_SET_ALIAS', async () => {
      const result = await hasRoles(client, {
        resolverAddress: resolverProxyAddress!,
        roles: ['ROLE_SET_ALIAS'],
        account: accounts[0],
      })

      expect(result).toBe(true)
    })

    it('returns false when account does not have root role', async () => {
      const result = await hasRoles(client, {
        resolverAddress: resolverProxyAddress!,
        roles: ['ROLE_SET_ALIAS'],
        account: getAddress('0x0000000000000000000000000000000000000001'),
      })

      expect(result).toBe(false)
    })
  })

  describe('resolver mode (with resource)', () => {
    it('returns true when account has role for resource', async () => {
      const result = await hasRoles(client, {
        resolverAddress: resolverProxyAddress!,
        resource: 0n,
        roles: ['ROLE_SET_TEXT'],
        account: accounts[0],
      })

      expect(result).toBe(true)
    })

    it('returns false when account does not have role for resource', async () => {
      const result = await hasRoles(client, {
        resolverAddress: resolverProxyAddress!,
        resource: computeResolverResource(
          '0x0000000000000000000000000000000000000000000000000000000000000001',
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        ),
        roles: ['ROLE_SET_TEXT'],
        account: getAddress('0x0000000000000000000000000000000000000001'),
      })

      expect(result).toBe(false)
    })
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
