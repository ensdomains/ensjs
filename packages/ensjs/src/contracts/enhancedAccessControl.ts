export const eacRolesChangedEventSnippet = [
  {
    inputs: [
      {
        indexed: true,
        name: 'resource',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        indexed: true,
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: false,
        name: 'oldRoleBitmap',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        indexed: false,
        name: 'newRoleBitmap',
        type: 'uint256',
        internalType: 'uint256',
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
    name: 'EACRootResourceNotAllowed',
    inputs: [],
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
        internalType: 'uint256',
      },
      {
        name: 'roleBitmap',
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
        type: 'bool',
        internalType: 'bool',
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
        internalType: 'uint256',
      },
      {
        name: 'rolesBitmap',
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
        type: 'bool',
        internalType: 'bool',
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
        internalType: 'uint256',
      },
      {
        name: 'roleBitmap',
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
        type: 'bool',
        internalType: 'bool',
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
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
] as const
