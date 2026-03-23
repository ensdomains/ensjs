export const permissionedRegistryGetStateSnippet = [
  {
    type: 'function',
    name: 'getState',
    inputs: [{ name: 'anyId', type: 'uint256' }],
    outputs: [
      {
        components: [
          { name: 'status', type: 'uint8' },
          { name: 'expiry', type: 'uint64' },
          { name: 'latestOwner', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'resource', type: 'uint256' },
        ],
        name: 'state',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
  },
] as const

export const permissionedRegistryGetResolverSnippet = [
  {
    type: 'function',
    name: 'getResolver',
    inputs: [{ name: 'label', type: 'string', internalType: 'string' }],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
] as const

export const permissionedRegistryGetSubregistrySnippet = [
  {
    type: 'function',
    name: 'getSubregistry',
    inputs: [{ name: 'label', type: 'string', internalType: 'string' }],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
] as const

export const permissionedRegistryRoleCountSnippet = [
  {
    type: 'function',
    name: 'roleCount',
    inputs: [
      {
        name: 'resource',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
] as const

export const permissionedRegistryGetExpirySnippet = [
  {
    type: 'function',
    name: 'getExpiry',
    inputs: [
      {
        name: 'anyId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
] as const

export const eacRolesGrantedEventSnippet = {
  type: 'event',
  name: 'EACRolesChanged',
  inputs: [
    {
      name: 'resource',
      type: 'uint256',
      indexed: true,
      internalType: 'uint256',
    },
    {
      name: 'account',
      type: 'address',
      indexed: true,
      internalType: 'address',
    },
    {
      name: 'oldRoleBitmap',
      type: 'uint256',
      indexed: false,
      internalType: 'uint256',
    },
    {
      name: 'newRoleBitmap',
      type: 'uint256',
      indexed: false,
      internalType: 'uint256',
    },
  ],
  anonymous: false,
} as const

export const eacRolesEvents = [eacRolesGrantedEventSnippet] as const

export const permissionedRegistryLabelRegisteredEventSnippet = {
  type: 'event',
  name: 'LabelRegistered',
  inputs: [
    {
      name: 'tokenId',
      type: 'uint256',
      indexed: true,
      internalType: 'uint256',
    },
    {
      name: 'labelHash',
      type: 'bytes32',
      indexed: true,
      internalType: 'bytes32',
    },
    {
      name: 'label',
      type: 'string',
      indexed: false,
      internalType: 'string',
    },
    {
      name: 'owner',
      type: 'address',
      indexed: false,
      internalType: 'address',
    },
    {
      name: 'expiry',
      type: 'uint64',
      indexed: false,
      internalType: 'uint64',
    },
    {
      name: 'registeredBy',
      type: 'address',
      indexed: false,
      internalType: 'address',
    },
  ],
  anonymous: false,
} as const

export const permissionedRegistryGetTokenIdSnippet = [
  {
    type: 'function',
    name: 'getTokenId',
    inputs: [
      {
        name: 'anyId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
] as const

export const permissionedRegistryRolesSnippet = [
  {
    type: 'function',
    name: 'roles',
    inputs: [
      {
        name: 'anyId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
] as const

export const permissionedRegistrySetResolverSnippet = [
  {
    type: 'function',
    name: 'setResolver',
    inputs: [
      {
        name: 'anyId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'resolver',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
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

// ─── PermissionedResolver: role checks ───────────────────────────────

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

// ─── PermissionedResolver: root role granting/revoking (inherited from EAC) ─

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

// ─── PermissionedResolver: name-aware role granting ──────────────────

export const permissionedResolverGrantNameRolesSnippet = [
  {
    name: 'grantNameRoles',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'toName', type: 'bytes' },
      { name: 'roleBitmap', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export const permissionedResolverGrantTextRolesSnippet = [
  {
    name: 'grantTextRoles',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'toName', type: 'bytes' },
      { name: 'key', type: 'string' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export const permissionedResolverGrantAddrRolesSnippet = [
  {
    name: 'grantAddrRoles',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'toName', type: 'bytes' },
      { name: 'coinType', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const
