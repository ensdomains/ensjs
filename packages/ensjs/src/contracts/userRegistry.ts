// ================================
// Standard ERC Events
// ================================

export const approvalEventSnippet = [
  {
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: true,
        name: 'approved',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: true,
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
    anonymous: false,
  },
] as const

export const approvalForAllEventSnippet = [
  {
    inputs: [
      {
        indexed: true,
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: true,
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: false,
        name: 'approved',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    name: 'ApprovalForAll',
    type: 'event',
    anonymous: false,
  },
] as const

export const transferSingleEventSnippet = [
  {
    inputs: [
      {
        indexed: true,
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: true,
        name: 'from',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: false,
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    name: 'TransferSingle',
    type: 'event',
    anonymous: false,
  },
] as const

export const transferBatchEventSnippet = [
  {
    inputs: [
      {
        indexed: true,
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: true,
        name: 'from',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: false,
        name: 'ids',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        indexed: false,
        name: 'values',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    name: 'TransferBatch',
    type: 'event',
    anonymous: false,
  },
] as const

export const uriEventSnippet = [
  {
    inputs: [
      {
        indexed: false,
        name: 'value',
        type: 'string',
        internalType: 'string',
      },
      {
        indexed: true,
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    name: 'URI',
    type: 'event',
    anonymous: false,
  },
] as const

// ================================
// Registry-Specific Events
// ================================

export const nameBurnedEventSnippet = [
  {
    inputs: [
      {
        indexed: true,
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        indexed: false,
        name: 'burnedBy',
        type: 'address',
        internalType: 'address',
      },
    ],
    name: 'NameBurned',
    type: 'event',
    anonymous: false,
  },
] as const

export const nameRenewedEventSnippet = [
  {
    inputs: [
      {
        indexed: true,
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        indexed: false,
        name: 'newExpiration',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        indexed: false,
        name: 'renewedBy',
        type: 'address',
        internalType: 'address',
      },
    ],
    name: 'NameRenewed',
    type: 'event',
    anonymous: false,
  },
] as const

export const newSubnameEventSnippet = [
  {
    inputs: [
      {
        indexed: true,
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        indexed: false,
        name: 'label',
        type: 'string',
        internalType: 'string',
      },
    ],
    name: 'NewSubname',
    type: 'event',
    anonymous: false,
  },
] as const

export const resolverUpdateEventSnippet = [
  {
    inputs: [
      {
        indexed: true,
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        indexed: false,
        name: 'resolver',
        type: 'address',
        internalType: 'address',
      },
    ],
    name: 'ResolverUpdate',
    type: 'event',
    anonymous: false,
  },
] as const

export const subregistryUpdateEventSnippet = [
  {
    inputs: [
      {
        indexed: true,
        name: 'id',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        indexed: false,
        name: 'subregistry',
        type: 'address',
        internalType: 'address',
      },
    ],
    name: 'SubregistryUpdate',
    type: 'event',
    anonymous: false,
  },
] as const

export const tokenObserverSetEventSnippet = [
  {
    inputs: [
      {
        indexed: true,
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        indexed: false,
        name: 'observer',
        type: 'address',
        internalType: 'address',
      },
    ],
    name: 'TokenObserverSet',
    type: 'event',
    anonymous: false,
  },
] as const

export const tokenRegeneratedEventSnippet = [
  {
    inputs: [
      {
        indexed: false,
        name: 'oldTokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        indexed: false,
        name: 'newTokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    name: 'TokenRegenerated',
    type: 'event',
    anonymous: false,
  },
] as const

// ================================
// Functions
// ================================

export const userRegistrySetSubregistrySnippet = [
  {
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'registry',
        type: 'address',
        internalType: 'contract IRegistry',
      },
    ],
    name: 'setSubregistry',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

// ================================
// Combined Snippets
// ================================

export const userRegistryAllEventsSnippet = [
  ...approvalEventSnippet,
  ...approvalForAllEventSnippet,
  ...nameBurnedEventSnippet,
  ...nameRenewedEventSnippet,
  ...newSubnameEventSnippet,
  ...resolverUpdateEventSnippet,
  ...subregistryUpdateEventSnippet,
  ...tokenObserverSetEventSnippet,
  ...tokenRegeneratedEventSnippet,
  ...transferBatchEventSnippet,
  ...transferSingleEventSnippet,
  ...uriEventSnippet,
] as const
