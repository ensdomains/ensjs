import { expect, it } from 'vitest'
import { decodeRoleCounts } from './decodeRoleCounts.js'
import * as registryRoles from './registryRoles.js'

it('decodes a role bitmap into a mapping of role counts', () => {
  expect(
    decodeRoleCounts(
      97409655027181761882228017414928043058174885888n,
      registryRoles,
    ),
  ).toEqual({
    ROLE_CAN_TRANSFER_ADMIN: 1,
    ROLE_REGISTER_RESERVED: 0,
    ROLE_REGISTER_RESERVED_ADMIN: 0,
    ROLE_REGISTRAR: 0,
    ROLE_REGISTRAR_ADMIN: 0,
    ROLE_RENEW: 0,
    ROLE_RENEW_ADMIN: 0,
    ROLE_SET_PARENT: 0,
    ROLE_SET_PARENT_ADMIN: 0,
    ROLE_SET_RESOLVER: 3,
    ROLE_SET_RESOLVER_ADMIN: 1,
    ROLE_SET_SUBREGISTRY: 2,
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
