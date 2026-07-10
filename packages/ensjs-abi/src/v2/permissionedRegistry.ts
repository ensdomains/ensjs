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

export const permissionedRegistryGetStatusSnippet = [
  {
    type: 'function',
    name: 'getStatus',
    inputs: [{ name: 'anyId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
] as const

export const permissionedRegistryGetResolverSnippet = [
  {
    type: 'function',
    name: 'getResolver',
    inputs: [{ name: 'label', type: 'string' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
] as const

export const permissionedRegistryGetSubregistrySnippet = [
  {
    type: 'function',
    name: 'getSubregistry',
    inputs: [{ name: 'label', type: 'string' }],
    outputs: [{ name: '', type: 'address' }],
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
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
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
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint64',
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
    },
    {
      name: 'account',
      type: 'address',
      indexed: true,
    },
    {
      name: 'oldRoleBitmap',
      type: 'uint256',
      indexed: false,
    },
    {
      name: 'newRoleBitmap',
      type: 'uint256',
      indexed: false,
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
    },
    {
      name: 'labelHash',
      type: 'bytes32',
      indexed: true,
    },
    {
      name: 'label',
      type: 'string',
      indexed: false,
    },
    {
      name: 'owner',
      type: 'address',
      indexed: false,
    },
    {
      name: 'expiry',
      type: 'uint64',
      indexed: false,
    },
    {
      name: 'sender',
      type: 'address',
      indexed: true,
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
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
] as const

export const permissionedRegistryGetResourceSnippet = [
  {
    type: 'function',
    name: 'getResource',
    inputs: [
      {
        name: 'anyId',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
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
      },
      {
        name: 'account',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
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
      },
      {
        name: 'resolver',
        type: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

export const permissionedRegistryUnregisterSnippet = [
  {
    type: 'function',
    name: 'unregister',
    inputs: [{ name: 'anyId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const
