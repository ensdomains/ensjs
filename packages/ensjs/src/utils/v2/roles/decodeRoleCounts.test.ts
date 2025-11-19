import { expect, it } from 'vitest'
import { REGISTRY_ROLES } from './constants.js'
import { decodeRoleCounts } from './decodeRoleCounts.js'

it('decodes a role bitmap into a mapping of role counts', () => {
  expect(
    decodeRoleCounts(
      REGISTRY_ROLES,
      358292832037329894457564098653916839351955968n,
    ),
  ).toEqual({
    CAN_TRANSFER: 0,
    SET_SUBREGISTRY: 2,
    SET_SUBREGISTRY_ADMIN: 1,
    SET_RESOLVER: 3,
    SET_RESOLVER_ADMIN: 1,
    CAN_TRANSFER_ADMIN: 1,
    REGISTRAR: 0,
    REGISTRAR_ADMIN: 0,
    RENEW: 0,
    RENEW_ADMIN: 0,
    SET_TOKEN_OBSERVER: 0,
    SET_TOKEN_OBSERVER_ADMIN: 0,
    UNREGISTER: 0,
    UNREGISTER_ADMIN: 0,
  })
})
