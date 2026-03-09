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
      label: 'ens1',
      fromBlock: 9792300n,
      toBlock: 9792310n,
      registryAddress: '0xF332544e6234f1CA149907D0d4658afD5feB6831',
    })

    expect(
      accounts.get('0x205d2686da3Bf33f64C17f21462c51B5eaD462CF')?.sort(),
    ).toEqual([
      'ROLE_CAN_TRANSFER_ADMIN',
      'ROLE_SET_RESOLVER',
      'ROLE_SET_RESOLVER_ADMIN',
      'ROLE_SET_SUBREGISTRY',
      'ROLE_SET_SUBREGISTRY_ADMIN',
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
