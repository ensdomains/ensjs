import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { getNameRoleAccounts } from './getNameRolesAccounts.js'

const client = createPublicClient({
  chain: sepolia,
  transport: http(
    'https://lb.drpc.live/sepolia/AnmpasF2C0JBqeAEzxVO8aRo7Ju0xlER8JS4QmlfqV1j',
  ),
})

describe('getNameRolesAccounts', () => {
  it('returns a map of accounts and roles that they have set', async () => {
    const accounts = await getNameRoleAccounts(client, {
      label: 'raffy',
      fromBlock: 9683977n,
      registryAddress: '0x0f3eb298470639a96bd548cea4a648bc80b2cee2',
    })

    expect(accounts.get('0x51050ec063d393217B436747617aD1C2285Aeeee')).toEqual([
      'SET_SUBREGISTRY',
      'SET_SUBREGISTRY_ADMIN',
      'SET_RESOLVER',
      'SET_RESOLVER_ADMIN',
      'CAN_TRANSFER_ADMIN',
    ])
  })
  it('returns an empty map for a non-existent label', async () => {
    const accounts = await getNameRoleAccounts(client, {
      label: 'thislabeldoesnotexist',
      fromBlock: 9683977n,
      registryAddress: '0x0f3eb298470639a96bd548cea4a648bc80b2cee2',
    })

    expect(accounts).toEqual(new Map())
  })
})
