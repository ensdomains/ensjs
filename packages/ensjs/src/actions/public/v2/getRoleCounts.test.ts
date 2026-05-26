import { describe, expect, it } from 'vitest'
import {
  publicClient as client,
  deploymentAddresses,
} from '../../../test/addTestContracts.js'
import { getRoleCounts } from './getRoleCounts.js'

describe('getRoleCounts', () => {
  it('returns role counts for a registered name', async () => {
    const result = await getRoleCounts(client, {
      registryAddress: deploymentAddresses.ETHRegistry,
      label: 'parent',
    })

    expect(result.decoded).toEqual({
      ROLE_CAN_TRANSFER_ADMIN: 1,
      ROLE_REGISTER_RESERVED: 0,
      ROLE_REGISTER_RESERVED_ADMIN: 0,
      ROLE_REGISTRAR: 0,
      ROLE_REGISTRAR_ADMIN: 0,
      ROLE_RENEW: 0,
      ROLE_RENEW_ADMIN: 0,
      ROLE_SET_PARENT: 0,
      ROLE_SET_PARENT_ADMIN: 0,
      ROLE_SET_RESOLVER: 1,
      ROLE_SET_RESOLVER_ADMIN: 1,
      ROLE_SET_SUBREGISTRY: 1,
      ROLE_SET_SUBREGISTRY_ADMIN: 1,
      ROLE_SET_URI: 0,
      ROLE_SET_URI_ADMIN: 0,
      ROLE_UNREGISTER: 0,
      ROLE_UNREGISTER_ADMIN: 0,
      ROLE_UPGRADE: 0,
      ROLE_UPGRADE_ADMIN: 0,
      ROLE_WAS_RESERVED: 0,
    })
  })

  it('returns higher count for SET_RESOLVER on changerole.eth (owner + user)', async () => {
    const result = await getRoleCounts(client, {
      registryAddress: deploymentAddresses.ETHRegistry,
      label: 'changerole',
    })

    expect(result.decoded).toEqual({
      ROLE_CAN_TRANSFER_ADMIN: 1,
      ROLE_REGISTER_RESERVED: 0,
      ROLE_REGISTER_RESERVED_ADMIN: 0,
      ROLE_REGISTRAR: 0,
      ROLE_REGISTRAR_ADMIN: 0,
      ROLE_RENEW: 0,
      ROLE_RENEW_ADMIN: 0,
      ROLE_SET_PARENT: 0,
      ROLE_SET_PARENT_ADMIN: 0,
      ROLE_SET_RESOLVER: 2,
      ROLE_SET_RESOLVER_ADMIN: 1,
      ROLE_SET_SUBREGISTRY: 1,
      ROLE_SET_SUBREGISTRY_ADMIN: 1,
      ROLE_SET_URI: 0,
      ROLE_SET_URI_ADMIN: 0,
      ROLE_UNREGISTER: 0,
      ROLE_UNREGISTER_ADMIN: 0,
      ROLE_UPGRADE: 0,
      ROLE_UPGRADE_ADMIN: 0,
      ROLE_WAS_RESERVED: 0,
    })
  })

  it('returns zero counts for a non-existent label', async () => {
    const result = await getRoleCounts(client, {
      registryAddress: deploymentAddresses.ETHRegistry,
      label: 'thislabeldoesnotexist12345',
    })

    expect(result.decoded).toEqual({
      ROLE_CAN_TRANSFER_ADMIN: 0,
      ROLE_REGISTER_RESERVED: 0,
      ROLE_REGISTER_RESERVED_ADMIN: 0,
      ROLE_REGISTRAR: 0,
      ROLE_REGISTRAR_ADMIN: 0,
      ROLE_RENEW: 0,
      ROLE_RENEW_ADMIN: 0,
      ROLE_SET_PARENT: 0,
      ROLE_SET_PARENT_ADMIN: 0,
      ROLE_SET_RESOLVER: 0,
      ROLE_SET_RESOLVER_ADMIN: 0,
      ROLE_SET_SUBREGISTRY: 0,
      ROLE_SET_SUBREGISTRY_ADMIN: 0,
      ROLE_SET_URI: 0,
      ROLE_SET_URI_ADMIN: 0,
      ROLE_UNREGISTER: 0,
      ROLE_UNREGISTER_ADMIN: 0,
      ROLE_UPGRADE: 0,
      ROLE_UPGRADE_ADMIN: 0,
      ROLE_WAS_RESERVED: 0,
    })
  })
})
