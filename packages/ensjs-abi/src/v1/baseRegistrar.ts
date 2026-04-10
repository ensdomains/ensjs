const erc721OwnerOfSnippet = [
  {
    inputs: [
      {
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'ownerOf',
    outputs: [
      {
        name: 'owner',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const erc721SafeTransferFromSnippet = [
  {
    inputs: [
      {
        name: 'from',
        type: 'address',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

const erc721SafeTransferFromWithDataSnippet = [
  {
    inputs: [
      {
        name: 'from',
        type: 'address',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
      },
      {
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const baseRegistrarAvailableSnippet = [
  {
    inputs: [
      {
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'available',
    outputs: [
      {
        name: 'available',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const baseRegistrarNameExpiresSnippet = [
  {
    inputs: [
      {
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'nameExpires',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const baseRegistrarGracePeriodSnippet = [
  {
    inputs: [],
    name: 'GRACE_PERIOD',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const baseRegistrarReclaimSnippet = [
  {
    inputs: [
      {
        name: 'id',
        type: 'uint256',
      },
      {
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'reclaim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const baseRegistrarSafeTransferFromSnippet = [
  ...erc721SafeTransferFromSnippet,
] as const

export const baseRegistrarSafeTransferFromWithDataSnippet = [
  ...erc721SafeTransferFromWithDataSnippet,
] as const

export const baseRegistrarOwnerOfSnippet = [...erc721OwnerOfSnippet] as const
