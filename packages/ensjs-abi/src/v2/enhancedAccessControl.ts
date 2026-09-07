/**
 * `Grant` — one `(account, roleBitmap)` pair, as declared by
 * `contracts-v2` `src/access-control/interfaces/IEACGrantInitializable.sol`.
 *
 * Every `EnhancedAccessControl` proxy is initialized from a *list* of these,
 * not from a single admin + bitmap. Shared by `UserRegistry.initialize` and
 * `PermissionedResolver.initialize`, so it lives here rather than in either.
 */
export const eacGrantComponents = [
  { name: 'account', type: 'address' },
  { name: 'roleBitmap', type: 'uint256' },
] as const

export const eacRolesChangedEventSnippet = [
  {
    inputs: [
      {
        indexed: true,
        name: 'resource',
        type: 'uint256',
      },
      {
        indexed: true,
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        name: 'oldRoleBitmap',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'newRoleBitmap',
        type: 'uint256',
      },
    ],
    name: 'EACRolesChanged',
    type: 'event',
    anonymous: false,
  },
] as const

export const eacErrors = [
  {
    type: 'error',
    name: 'EACCannotGrantRoles',
    inputs: [
      { name: 'resource', type: 'uint256' },
      { name: 'roleBitmap', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
  },
  {
    type: 'error',
    name: 'EACCannotRevokeRoles',
    inputs: [
      { name: 'resource', type: 'uint256' },
      { name: 'roleBitmap', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
  },
  {
    type: 'error',
    name: 'EACInvalidAccount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EACInvalidRoleBitmap',
    inputs: [{ name: 'roleBitmap', type: 'uint256' }],
  },
  {
    type: 'error',
    name: 'EACMaxAssignees',
    inputs: [
      { name: 'resource', type: 'uint256' },
      { name: 'roleBitmap', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'EACMinAssignees',
    inputs: [
      { name: 'resource', type: 'uint256' },
      { name: 'roleBitmap', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'EACRootResourceNotAllowed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EACUnauthorizedAccountRoles',
    inputs: [
      { name: 'resource', type: 'uint256' },
      { name: 'roleBitmap', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
  },
] as const

/**
 * `IEACGrantInitializable.initialize(Grant[])` — interface selector
 * `0x37cb53a8`. This is the initializer a bare `EnhancedAccessControl` proxy
 * (e.g. `UserRegistry`) takes; `PermissionedResolver` extends it with a
 * trailing `bytes[] calls` batch.
 */
export const eacGrantInitializeSnippet = [
  ...eacErrors,
  {
    inputs: [
      {
        name: 'grants',
        type: 'tuple[]',
        components: eacGrantComponents,
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const eacGrantRolesSnippet = [
  ...eacErrors,
  {
    type: 'function',
    name: 'grantRoles',
    inputs: [
      {
        name: 'resource',
        type: 'uint256',
      },
      {
        name: 'roleBitmap',
        type: 'uint256',
      },
      {
        name: 'account',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
] as const

export const eacGrantRootRolesSnippet = [
  ...eacErrors,
  {
    type: 'function',
    name: 'grantRootRoles',
    inputs: [
      {
        name: 'roleBitmap',
        type: 'uint256',
      },
      {
        name: 'account',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
] as const

export const eacHasRolesSnippet = [
  {
    type: 'function',
    name: 'hasRoles',
    inputs: [
      {
        name: 'resource',
        type: 'uint256',
      },
      {
        name: 'rolesBitmap',
        type: 'uint256',
      },
      {
        name: 'account',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
  },
] as const

export const eacRevokeRolesSnippet = [
  ...eacErrors,
  {
    type: 'function',
    name: 'revokeRoles',
    inputs: [
      {
        name: 'resource',
        type: 'uint256',
      },
      {
        name: 'roleBitmap',
        type: 'uint256',
      },
      {
        name: 'account',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
] as const

export const eacRevokeRootRolesSnippet = [
  ...eacErrors,
  {
    type: 'function',
    name: 'revokeRootRoles',
    inputs: [
      {
        name: 'roleBitmap',
        type: 'uint256',
      },
      {
        name: 'account',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
] as const
