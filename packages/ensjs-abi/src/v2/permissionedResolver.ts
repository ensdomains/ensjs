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
