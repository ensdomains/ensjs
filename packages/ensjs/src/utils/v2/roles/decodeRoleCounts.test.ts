import { expect, it } from 'vitest'
import { decodeRoleCounts } from './decodeRoleCounts.js'
import * as registryRoles from './registryRoles.js'

it('decodes a role bitmap into a mapping of role counts', () => {
  expect(
    decodeRoleCounts(
      358292832037329894457564098653916839351955968n,
      registryRoles,
    ),
  ).toEqual({
    ROLE_BURN: 0,
    ROLE_BURN_ADMIN: 0,
    ROLE_CAN_TRANSFER_ADMIN: 1,
    ROLE_REGISTRAR: 0,
    ROLE_REGISTRAR_ADMIN: 0,
    ROLE_RENEW: 0,
    ROLE_RENEW_ADMIN: 0,
    ROLE_SET_RESOLVER: 3,
    ROLE_SET_RESOLVER_ADMIN: 1,
    ROLE_SET_SUBREGISTRY: 2,
    ROLE_SET_SUBREGISTRY_ADMIN: 1,
    ROLE_SET_TOKEN_OBSERVER: 0,
    ROLE_SET_TOKEN_OBSERVER_ADMIN: 0,
  })
})
