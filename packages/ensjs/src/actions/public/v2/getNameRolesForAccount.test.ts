import { describe, expect, it } from 'vitest'
import {
  publicClient as client,
  deploymentAddresses,
} from '../../../test/addTestContracts.js'
import { getNameRolesForAccount } from './getNameRolesForAccount.js'

describe('getNameRolesForAccount', () => {
  it('returns roles for the owner of a registered name', async () => {
    const result = await getNameRolesForAccount(client, {
      registryAddress: deploymentAddresses.ETHRegistry,
      label: 'parent',
      account: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    })

    expect(result.decoded).toEqual([
      'ROLE_CAN_TRANSFER_ADMIN',
      'ROLE_SET_RESOLVER',
      'ROLE_SET_RESOLVER_ADMIN',
      'ROLE_SET_SUBREGISTRY',
      'ROLE_SET_SUBREGISTRY_ADMIN',
    ])
  })

  it('returns SET_RESOLVER for user granted that role on changerole.eth', async () => {
    const result = await getNameRolesForAccount(client, {
      registryAddress: deploymentAddresses.ETHRegistry,
      label: 'changerole',
      account: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    })

    expect(result.decoded).toEqual(['ROLE_SET_RESOLVER'])
  })

  it('returns empty roles for an account with no roles', async () => {
    const result = await getNameRolesForAccount(client, {
      registryAddress: deploymentAddresses.ETHRegistry,
      label: 'parent',
      account: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    })

    expect(result.raw).toBe(0n)
    expect(result.decoded).toEqual([])
  })
})
