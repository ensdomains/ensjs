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

export const eacRolesGrantedEventSnippet = {
  type: 'event',
  name: 'EACRolesGranted',
  inputs: [
    {
      name: 'resource',
      type: 'uint256',
      indexed: false,
      internalType: 'uint256',
    },
    {
      name: 'roleBitmap',
      type: 'uint256',
      indexed: false,
      internalType: 'uint256',
    },
    {
      name: 'account',
      type: 'address',
      indexed: false,
      internalType: 'address',
    },
  ],
  anonymous: false,
} as const

export const eacRolesEvents = [eacRolesGrantedEventSnippet] as const
