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
 * `revokeRoles(resource, roleBitmap, account)` — revokes roles on any resource:
 * the root resource, or the resource of a single setter argument (see
 * `computeResolverResource`).
 *
 * This is a real call on the post-audit-2 resolver. The `authorize*Roles`
 * family it replaced no longer exists on the contract.
 */
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
 * `INameResolver.name(bytes32)` — the legacy reverse-record getter, implemented
 * by v1-style resolvers. The post-audit-2 `PermissionedResolver` does NOT have
 * it; read its `name` record through `resolve` instead.
 */
export const nameResolverNameSnippet = [
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

/**
 * `multicallWithNodeCheck(bytes32, bytes[])` — kept on the contract for ABI
 * compatibility, but the node argument is ignored and the inner calls are the
 * name-based setters. Prefer {@link permissionedResolverMulticallSnippet}.
 */
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

// ─── Errors ──────────────────────────────────────────────────────────

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

// ─── Reads ───────────────────────────────────────────────────────────

/**
 * `resolve(bytes name, bytes data)` — ENSIP-10, and the only read path on this
 * resolver. The `bytes32 node` inside `data` is ignored; the record is found
 * from `name`. There are no direct getters (`addr(node)`, `text(node, key)`,
 * `name(node)`) any more.
 */
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

/**
 * Records are internal inodes. A setter creates one and links the name to it;
 * these re-point a name at an existing record so several names serve the same
 * records. This is what replaced `setAlias`, which no longer exists.
 *
 * Both require `ROLE_LINK` on the root resource.
 */
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

/** `linkToRecord(sourceName, 0)` unlinks; the name then reads the default record. */
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

// ─── Argument-scoped roles ───────────────────────────────────────────

/**
 * `grantSetterRoles(setter, account)` — grants one setter's role scoped to the
 * argument encoded in `setter`, across every name on the resolver. `setter` is
 * ABI-encoded calldata for `setAddress`, `setText`, `setData`, `setABI` or
 * `setInterface`; the name and value inside it are ignored.
 *
 * This replaced the `authorize*Roles` family, which no longer exists. Note the
 * scope: a resolver is already per account, so roles are never per name.
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

/** Splits setter calldata into its argument, EAC resource and role bitmap. */
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

export const permissionedResolverRoleCountSnippet = [
  {
    name: 'roleCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'resource', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

// ─── Events ──────────────────────────────────────────────────────────

/**
 * Indexing shape: keep `links[node] -> recordId` from `Linked` (0 unlinks) and
 * `record[recordId]` from the `*Updated` events. A name's effective records are
 * `record[links[node]]`, falling back to the default record when unlinked.
 * `recordId` is scoped to the resolver instance.
 */
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
  // Declared on `IRecordResolver` but never emitted by `PermissionedResolver`,
  // which has no `clear`. Here for other implementations of the interface.
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
