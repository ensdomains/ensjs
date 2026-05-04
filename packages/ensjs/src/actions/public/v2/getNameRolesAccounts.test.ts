import { describe, expect, it } from 'vitest'
import {
  publicClient as client,
  deploymentAddresses,
} from '../../../test/addTestContracts.js'
import { getNameRoleAccounts } from './getNameRolesAccounts.js'

describe('getNameRoleAccounts', () => {
  it('returns a map of accounts and roles', async () => {
    const accounts = await getNameRoleAccounts(client, {
      label: 'changerole',
      registryAddress: deploymentAddresses.ETHRegistry,
    })

    expect(accounts.size).toBeGreaterThan(0)
    expect(
      accounts.get('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
    ).toBeDefined()
  })

  it('returns an empty map for a non-existent label', async () => {
    const accounts = await getNameRoleAccounts(client, {
      label: 'thislabeldoesnotexist12345',
      fromBlock: 0n,
      toBlock: 'latest',
      registryAddress: deploymentAddresses.ETHRegistry,
    })

    expect(accounts).toEqual(new Map())
  })
})
