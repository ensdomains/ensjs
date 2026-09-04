/**
 * `PermissionedResolver` (contracts-v2 `post-audit-2`, PR #417).
 *
 * Setters take the DNS-encoded name, not a `bytes32` node. Records are
 * internal inodes: a write creates one and links the name to it, `linkToNode`
 * / `linkToRecord` re-point a name, `linkToRecord(name, 0)` unlinks it. Roles
 * are root-scoped (`grantRootRoles`) or scoped to one setter argument
 * (`grantSetterRoles`); per-name grants no longer exist.
 */

export const permissionedResolverErrors = [
  { type: 'error', name: 'InvalidRecord', inputs: [] },
  {
    type: 'error',
    name: 'UnsupportedResolverProfile',
    inputs: [{ name: 'selector', type: 'bytes4' }],
  },
  {
    type: 'error',
    name: 'InvalidEVMAddress',
    inputs: [{ name: 'addressBytes', type: 'bytes' }],
  },
  {
    type: 'error',
    name: 'InvalidContentType',
    inputs: [{ name: 'contentType', type: 'uint256' }],
  },
] as const

// ─── Setters ─────────────────────────────────────────────────────────

export const permissionedResolverSetAddressSnippet = [
  {
    name: 'setAddress',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'coinType', type: 'uint256' },
      { name: 'addressBytes', type: 'bytes' },
    ],
    outputs: [],
  },
] as const

export const permissionedResolverSetTextSnippet = [
  {
    name: 'setText',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    outputs: [],
  },
] as const

export const permissionedResolverSetContenthashSnippet = [
  {
    name: 'setContenthash',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'hash', type: 'bytes' },
    ],
    outputs: [],
  },
] as const

export const permissionedResolverSetAbiSnippet = [
  {
    name: 'setABI',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'contentType', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    outputs: [],
  },
] as const

export const permissionedResolverSetDataSnippet = [
  {
    name: 'setData',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'bytes' },
    ],
    outputs: [],
  },
] as const

export const permissionedResolverSetInterfaceSnippet = [
  {
    name: 'setInterface',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'interfaceId', type: 'bytes4' },
      { name: 'implementer', type: 'address' },
    ],
    outputs: [],
  },
] as const

export const permissionedResolverSetNameSnippet = [
  {
    name: 'setName',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'primaryName', type: 'string' },
    ],
    outputs: [],
  },
] as const

/** Every setter, for decoding arbitrary setter calldata. */
export const permissionedResolverSettersSnippet = [
  ...permissionedResolverSetAddressSnippet,
  ...permissionedResolverSetTextSnippet,
  ...permissionedResolverSetContenthashSnippet,
  ...permissionedResolverSetAbiSnippet,
  ...permissionedResolverSetDataSnippet,
  ...permissionedResolverSetInterfaceSnippet,
  ...permissionedResolverSetNameSnippet,
] as const

export const permissionedResolverMulticallSnippet = [
  {
    name: 'multicall',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'data', type: 'bytes[]' }],
    outputs: [{ name: 'results', type: 'bytes[]' }],
  },
] as const

// ─── Reads ───────────────────────────────────────────────────────────

/** ENSIP-10 `resolve`; the only read path on this resolver. */
export const permissionedResolverResolveSnippet = [
  ...permissionedResolverErrors,
  {
    name: 'resolve',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'data', type: 'bytes' },
    ],
    outputs: [{ name: '', type: 'bytes' }],
  },
] as const

// ─── Links ───────────────────────────────────────────────────────────

export const permissionedResolverLinkToNodeSnippet = [
  ...permissionedResolverErrors,
  {
    name: 'linkToNode',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'sourceName', type: 'bytes' },
      { name: 'targetNode', type: 'bytes32' },
    ],
    outputs: [],
  },
] as const

export const permissionedResolverLinkToRecordSnippet = [
  ...permissionedResolverErrors,
  {
    name: 'linkToRecord',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'sourceName', type: 'bytes' },
      { name: 'recordId', type: 'uint256' },
    ],
    outputs: [],
  },
] as const

export const permissionedResolverGetRecordIdSnippet = [
  {
    name: 'getRecordId',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export const permissionedResolverGetRecordCountSnippet = [
  {
    name: 'getRecordCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

// ─── Roles ───────────────────────────────────────────────────────────

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

export const permissionedResolverRoleCountSnippet = [
  {
    name: 'roleCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'resource', type: 'uint256' }],
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

/** Revokes roles on any resource: the root resource or a setter resource. */
export const permissionedResolverRevokeRolesSnippet = [
  {
    name: 'revokeRoles',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'resource', type: 'uint256' },
      { name: 'roleBitmap', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

/**
 * @deprecated `grantRoles` on `PermissionedResolver` is `pure` and always
 * reverts with `EACCannotGrantRoles`. Use
 * {@link permissionedResolverGrantRootRolesSnippet} for root roles or
 * {@link permissionedResolverGrantSetterRolesSnippet} for argument-scoped roles.
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

/**
 * Grants the setter's role scoped to the argument encoded in `setter`, which is
 * ABI-encoded calldata for `setAddress`, `setText`, `setData`, `setABI` or
 * `setInterface` (the name and value inside it are ignored).
 */
export const permissionedResolverGrantSetterRolesSnippet = [
  {
    name: 'grantSetterRoles',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'setter', type: 'bytes' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export const permissionedResolverDecodeSetterSnippet = [
  {
    name: 'decodeSetter',
    type: 'function',
    stateMutability: 'pure',
    inputs: [{ name: 'setter', type: 'bytes' }],
    outputs: [
      { name: 'arg', type: 'bytes' },
      { name: 'resource', type: 'uint256' },
      { name: 'roleBitmap', type: 'uint256' },
    ],
  },
] as const

// ─── Lifecycle ───────────────────────────────────────────────────────

/** `initialize(Grant[] grants, bytes[] calls)`: root grants plus an init multicall. */
export const permissionedResolverInitializeSnippet = [
  {
    name: 'initialize',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'grants',
        type: 'tuple[]',
        components: [
          { name: 'account', type: 'address' },
          { name: 'roleBitmap', type: 'uint256' },
        ],
      },
      { name: 'calls', type: 'bytes[]' },
    ],
    outputs: [],
  },
] as const

// ─── Events ──────────────────────────────────────────────────────────

export const permissionedResolverEventsSnippet = [
  { type: 'event', name: 'ResolverCreated', inputs: [], anonymous: false },
  {
    type: 'event',
    name: 'Linked',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'recordId', type: 'uint256' },
      { indexed: true, name: 'node', type: 'bytes32' },
      { indexed: false, name: 'name', type: 'bytes' },
    ],
  },
  {
    type: 'event',
    name: 'Cleared',
    anonymous: false,
    inputs: [{ indexed: true, name: 'recordId', type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'AddressUpdated',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'recordId', type: 'uint256' },
      { indexed: false, name: 'coinType', type: 'uint256' },
      { indexed: false, name: 'addressBytes', type: 'bytes' },
    ],
  },
  {
    type: 'event',
    name: 'TextUpdated',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'recordId', type: 'uint256' },
      { indexed: true, name: 'keyHash', type: 'string' },
      { indexed: false, name: 'key', type: 'string' },
      { indexed: false, name: 'value', type: 'string' },
    ],
  },
  {
    type: 'event',
    name: 'DataUpdated',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'recordId', type: 'uint256' },
      { indexed: true, name: 'keyHash', type: 'string' },
      { indexed: false, name: 'key', type: 'string' },
      { indexed: false, name: 'value', type: 'bytes' },
    ],
  },
  {
    type: 'event',
    name: 'ABIUpdated',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'recordId', type: 'uint256' },
      { indexed: true, name: 'contentType', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'ContenthashUpdated',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'recordId', type: 'uint256' },
      { indexed: false, name: 'hash', type: 'bytes' },
    ],
  },
  {
    type: 'event',
    name: 'InterfaceUpdated',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'recordId', type: 'uint256' },
      { indexed: true, name: 'interfaceId', type: 'bytes4' },
      { indexed: false, name: 'implementer', type: 'address' },
    ],
  },
  {
    type: 'event',
    name: 'NameUpdated',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'recordId', type: 'uint256' },
      { indexed: false, name: 'primaryName', type: 'string' },
    ],
  },
  {
    type: 'event',
    name: 'ResourceArgument',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'resource', type: 'uint256' },
      { indexed: false, name: 'arg', type: 'bytes' },
    ],
  },
] as const

/**
 * `INameResolver.name(bytes32)`, the legacy reverse-record getter. Not
 * implemented by the post-audit-2 `PermissionedResolver` (read through
 * `resolve` instead); kept for v1-style resolvers.
 */
export const nameResolverNameSnippet = [
  {
    inputs: [{ name: 'node', type: 'bytes32' }],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
