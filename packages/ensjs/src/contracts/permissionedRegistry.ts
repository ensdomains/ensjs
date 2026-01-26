export const permissionedRegistryGetNameDataSnippet = [
  {
    inputs: [{ internalType: 'string', name: 'label', type: 'string' }],
    name: 'getNameData',
    outputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      {
        internalType: 'struct IRegistryDatastore.Entry',
        name: 'entry',
        type: 'tuple',
        components: [
          { internalType: 'uint64', name: 'expiry', type: 'uint64' },
          { internalType: 'uint32', name: 'tokenVersionId', type: 'uint32' },
          { internalType: 'address', name: 'subregistry', type: 'address' },
          { internalType: 'uint32', name: 'eacVersionId', type: 'uint32' },
          { internalType: 'address', name: 'resolver', type: 'address' },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
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

export const permissionedRegistryNameRegisteredEventSnippet = {
  type: 'event',
  name: 'NameRegistered',
  inputs: [
    {
      name: 'tokenId',
      type: 'uint256',
      indexed: true,
      internalType: 'uint256',
    },
    {
      name: 'label',
      type: 'string',
      indexed: false,
      internalType: 'string',
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
