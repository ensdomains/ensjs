import type { Address } from 'viem'
import { describe, expect, it } from 'vitest'
import {
  computeResolverResource,
  encodeResolverSetterScope,
} from '../../../../utils/v2/roles/resolverResource.js'
import {
  RESOLVER_ROLE_LINK,
  RESOLVER_ROLE_SET_ADDRESS,
  RESOLVER_ROLE_SET_TEXT,
} from '../../../../utils/v2/roles/resolverRoles.js'
import { grantResolverRolesWriteParameters } from './grantResolverRoles.js'
import { revokeResolverRolesWriteParameters } from './revokeResolverRoles.js'

const resolverAddress = '0x1111111111111111111111111111111111111111' as Address
const targetAccount = '0x3333333333333333333333333333333333333333' as Address
const client = {
  account: { address: '0x2222222222222222222222222222222222222222' },
  chain: { id: 1 },
} as unknown as Parameters<typeof grantResolverRolesWriteParameters>[0]

describe('grantResolverRolesWriteParameters', () => {
  it('encodes grantRootRoles for the root scope', () => {
    const params = grantResolverRolesWriteParameters(client, {
      resolverAddress,
      targetAccount,
      scope: 'root',
      roles: ['ROLE_SET_TEXT', 'ROLE_LINK'],
    })
    expect(params.functionName).toBe('grantRootRoles')
    expect(params.args).toEqual([
      RESOLVER_ROLE_SET_TEXT | RESOLVER_ROLE_LINK,
      targetAccount,
    ])
  })

  it('encodes grantSetterRoles with setter calldata for the setter scope', () => {
    const setter = { kind: 'text', key: 'avatar' } as const
    const params = grantResolverRolesWriteParameters(client, {
      resolverAddress,
      targetAccount,
      scope: 'setter',
      setter,
    })
    expect(params.functionName).toBe('grantSetterRoles')
    expect(params.args).toEqual([
      encodeResolverSetterScope(setter),
      targetAccount,
    ])
  })
})

describe('revokeResolverRolesWriteParameters', () => {
  it('encodes revokeRootRoles for the root scope', () => {
    const params = revokeResolverRolesWriteParameters(client, {
      resolverAddress,
      targetAccount,
      scope: 'root',
      roles: ['ROLE_LINK'],
    })
    expect(params.functionName).toBe('revokeRootRoles')
    expect(params.args).toEqual([RESOLVER_ROLE_LINK, targetAccount])
  })

  it('encodes revokeRoles on the setter resource with the implied role', () => {
    const setter = { kind: 'address', coinType: 60n } as const
    const params = revokeResolverRolesWriteParameters(client, {
      resolverAddress,
      targetAccount,
      scope: 'setter',
      setter,
    })
    expect(params.functionName).toBe('revokeRoles')
    expect(params.args).toEqual([
      computeResolverResource(setter),
      RESOLVER_ROLE_SET_ADDRESS,
      targetAccount,
    ])
  })

  it('encodes revokeRoles on a raw resource', () => {
    const params = revokeResolverRolesWriteParameters(client, {
      resolverAddress,
      targetAccount,
      scope: 'resource',
      resource: 42n,
      roles: ['ROLE_SET_TEXT'],
    })
    expect(params.args).toEqual([42n, RESOLVER_ROLE_SET_TEXT, targetAccount])
  })
})
