import { eacGrantComponents } from './enhancedAccessControl.js'

/**
 * `PermissionedResolver.initialize(Grant[] grants, bytes[] calls)` — selector
 * `0x33cc44a0`. Grants each `(account, roleBitmap)` pair on the root resource,
 * then runs `calls` through `multicall` so a proxy can be deployed with its
 * initial records already written.
 *
 * NOT `initialize(address,uint256,bytes[])` — that older shape predates
 * `IEACGrantInitializable` and no longer exists on the deployed implementation,
 * where it hits the fallback and reverts with empty data.
 */
export const permissionedResolverInitializeSnippet = [
  {
    inputs: [
      {
        name: 'grants',
        type: 'tuple[]',
        components: eacGrantComponents,
      },
      { name: 'calls', type: 'bytes[]' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

/**
 * Record setters.
 *
 * Every one takes the DNS-encoded `name` (`bytes`) — NOT the `bytes32 node` the
 * v1 `PublicResolver` setters take. The resolver derives the record id from the
 * name itself, so passing a namehash here hits the fallback and reverts with
 * empty data. Use `toHex(packetToBytes(name))` from `viem/ens` to encode.
 *
 * `setAddr` is also renamed to `setAddress`; the other setters keep their v1
 * names but still change selector because of the first argument:
 *
 *   setAddress    0xb4436dde  (v1 setAddr        0x8b95dd71)
 *   setText       0xc7279f88  (v1 setText        0x10f13a8c)
 *   setContenthash 0xc5d7badd (v1 setContenthash 0x304e6ade)
 *   setABI        0xd26f550e  (v1 setABI         0x623195b0)
 *
 * See contracts-v2 `src/resolver/PermissionedResolver.sol`.
 */
export const permissionedResolverSetAddressSnippet = [
  {
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'coinType', type: 'uint256' },
      { name: 'addressBytes', type: 'bytes' },
    ],
    name: 'setAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const permissionedResolverSetTextSnippet = [
  {
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    name: 'setText',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const permissionedResolverSetContenthashSnippet = [
  {
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'hash', type: 'bytes' },
    ],
    name: 'setContenthash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const permissionedResolverSetAbiSnippet = [
  {
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'contentType', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    name: 'setABI',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const permissionedResolverSetDataSnippet = [
  {
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'bytes' },
    ],
    name: 'setData',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const permissionedResolverSetNameSnippet = [
  {
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'primaryName', type: 'string' },
    ],
    name: 'setName',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const permissionedResolverSetInterfaceSnippet = [
  {
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'interfaceId', type: 'bytes4' },
      { name: 'implementer', type: 'address' },
    ],
    name: 'setInterface',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

/** `multicall(bytes[])` — batches the setters above into one call. */
export const permissionedResolverMulticallSnippet = [
  {
    inputs: [{ name: 'data', type: 'bytes[]' }],
    name: 'multicall',
    outputs: [{ name: 'results', type: 'bytes[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const permissionedResolverAliasSnippet = [
  {
    name: 'setAlias',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'fromName', type: 'bytes' },
      { name: 'toName', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    name: 'getAlias',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'fromName', type: 'bytes' }],
    outputs: [{ name: 'toName', type: 'bytes' }],
  },
] as const

export const permissionedResolverHasRootRolesSnippet = [
  {
    name: 'hasRootRoles',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'roleBitmap', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export const permissionedResolverHasRolesSnippet = [
  {
    name: 'hasRoles',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'resource', type: 'uint256' },
      { name: 'roleBitmap', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export const permissionedResolverRolesSnippet = [
  {
    name: 'roles',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'resource', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export const permissionedResolverGrantRootRolesSnippet = [
  {
    name: 'grantRootRoles',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'roleBitmap', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export const permissionedResolverRevokeRootRolesSnippet = [
  {
    name: 'revokeRootRoles',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'roleBitmap', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

/**
 * @deprecated `revokeRoles` on `PermissionedResolver` is `pure` and always reverts with
 * `EACCannotRevokeRoles`. Use {@link permissionedResolverRevokeRootRolesSnippet} for root
 * roles, or {@link permissionedResolverAuthorizeNameRolesSnippet} /
 * {@link permissionedResolverAuthorizeTextRolesSnippet} /
 * {@link permissionedResolverAuthorizeAddrRolesSnippet} /
 * {@link permissionedResolverAuthorizeDataRolesSnippet} for name- or part-scoped roles.
 */
export const permissionedResolverRevokeRolesSnippet = [
  {
    name: 'revokeRoles',
    type: 'function',
    stateMutability: 'pure',
    inputs: [
      { name: 'resource', type: 'uint256' },
      { name: 'roleBitmap', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

/**
 * @deprecated `grantRoles` on `PermissionedResolver` is `pure` and always reverts with
 * `EACCannotGrantRoles`. Use {@link permissionedResolverGrantRootRolesSnippet} for root
 * roles, or {@link permissionedResolverAuthorizeNameRolesSnippet} /
 * {@link permissionedResolverAuthorizeTextRolesSnippet} /
 * {@link permissionedResolverAuthorizeAddrRolesSnippet} /
 * {@link permissionedResolverAuthorizeDataRolesSnippet} for name- or part-scoped roles.
 */
export const permissionedResolverGrantRolesSnippet = [
  {
    name: 'grantRoles',
    type: 'function',
    stateMutability: 'pure',
    inputs: [
      { name: 'resource', type: 'uint256' },
      { name: 'roleBitmap', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export const permissionedResolverAuthorizeNameRolesSnippet = [
  {
    name: 'authorizeNameRoles',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'toName', type: 'bytes' },
      { name: 'roleBitmap', type: 'uint256' },
      { name: 'account', type: 'address' },
      { name: 'grant', type: 'bool' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export const permissionedResolverAuthorizeTextRolesSnippet = [
  {
    name: 'authorizeTextRoles',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'toName', type: 'bytes' },
      { name: 'key', type: 'string' },
      { name: 'account', type: 'address' },
      { name: 'grant', type: 'bool' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export const permissionedResolverAuthorizeAddrRolesSnippet = [
  {
    name: 'authorizeAddrRoles',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'toName', type: 'bytes' },
      { name: 'coinType', type: 'uint256' },
      { name: 'account', type: 'address' },
      { name: 'grant', type: 'bool' },
    ],
    outputs: [{ name: 'updated', type: 'bool' }],
  },
] as const

export const permissionedResolverAuthorizeDataRolesSnippet = [
  {
    name: 'authorizeDataRoles',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'toName', type: 'bytes' },
      { name: 'key', type: 'string' },
      { name: 'account', type: 'address' },
      { name: 'grant', type: 'bool' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export const permissionedResolverNameSnippet = [
  {
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
    ],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const permissionedResolverMulticallWithNodeCheckSnippet = [
  {
    inputs: [
      {
        name: '',
        type: 'bytes32',
      },
      {
        name: 'calls',
        type: 'bytes[]',
      },
    ],
    name: 'multicallWithNodeCheck',
    outputs: [
      {
        name: '',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const permissionedResolverClearRecordsSnippet = [
  {
    inputs: [{ name: 'node', type: 'bytes32' }],
    name: 'clearRecords',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
