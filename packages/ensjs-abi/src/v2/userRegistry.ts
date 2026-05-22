// ─── ERC1155 events ────────────────────────────────────────────────

export const approvalForAllEventSnippet = [
  {
    inputs: [
      { indexed: true, name: 'account', type: 'address' },
      { indexed: true, name: 'operator', type: 'address' },
      { indexed: false, name: 'approved', type: 'bool' },
    ],
    name: 'ApprovalForAll',
    type: 'event',
    anonymous: false,
  },
] as const

export const transferSingleEventSnippet = [
  {
    inputs: [
      { indexed: true, name: 'operator', type: 'address' },
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'id', type: 'uint256' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'TransferSingle',
    type: 'event',
    anonymous: false,
  },
] as const

export const transferBatchEventSnippet = [
  {
    inputs: [
      { indexed: true, name: 'operator', type: 'address' },
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'ids', type: 'uint256[]' },
      { indexed: false, name: 'values', type: 'uint256[]' },
    ],
    name: 'TransferBatch',
    type: 'event',
    anonymous: false,
  },
] as const

export const uriEventSnippet = [
  {
    inputs: [
      { indexed: false, name: 'value', type: 'string' },
      { indexed: true, name: 'id', type: 'uint256' },
    ],
    name: 'URI',
    type: 'event',
    anonymous: false,
  },
] as const

// ─── Registry lifecycle events ─────────────────────────────────────

export const labelRegisteredEventSnippet = [
  {
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'labelHash', type: 'bytes32' },
      { indexed: false, name: 'label', type: 'string' },
      { indexed: false, name: 'owner', type: 'address' },
      { indexed: false, name: 'expiry', type: 'uint64' },
      { indexed: true, name: 'sender', type: 'address' },
    ],
    name: 'LabelRegistered',
    type: 'event',
    anonymous: false,
  },
] as const

export const labelReservedEventSnippet = [
  {
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'labelHash', type: 'bytes32' },
      { indexed: false, name: 'label', type: 'string' },
      { indexed: false, name: 'expiry', type: 'uint64' },
      { indexed: true, name: 'sender', type: 'address' },
    ],
    name: 'LabelReserved',
    type: 'event',
    anonymous: false,
  },
] as const

export const labelUnregisteredEventSnippet = [
  {
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'sender', type: 'address' },
    ],
    name: 'LabelUnregistered',
    type: 'event',
    anonymous: false,
  },
] as const

export const expiryUpdatedEventSnippet = [
  {
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'newExpiry', type: 'uint64' },
      { indexed: true, name: 'sender', type: 'address' },
    ],
    name: 'ExpiryUpdated',
    type: 'event',
    anonymous: false,
  },
] as const

export const parentUpdatedEventSnippet = [
  {
    inputs: [
      { indexed: true, name: 'parent', type: 'address' },
      { indexed: false, name: 'label', type: 'string' },
      { indexed: true, name: 'sender', type: 'address' },
    ],
    name: 'ParentUpdated',
    type: 'event',
    anonymous: false,
  },
] as const

export const resolverUpdatedEventSnippet = [
  {
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'resolver', type: 'address' },
      { indexed: true, name: 'sender', type: 'address' },
    ],
    name: 'ResolverUpdated',
    type: 'event',
    anonymous: false,
  },
] as const

export const subregistryUpdatedEventSnippet = [
  {
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'subregistry', type: 'address' },
      { indexed: true, name: 'sender', type: 'address' },
    ],
    name: 'SubregistryUpdated',
    type: 'event',
    anonymous: false,
  },
] as const

export const tokenResourceEventSnippet = [
  {
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'resource', type: 'uint256' },
    ],
    name: 'TokenResource',
    type: 'event',
    anonymous: false,
  },
] as const

export const upgradedEventSnippet = [
  {
    inputs: [{ indexed: true, name: 'implementation', type: 'address' }],
    name: 'Upgraded',
    type: 'event',
    anonymous: false,
  },
] as const

// ─── Functions ─────────────────────────────────────────────────────

export const userRegistrySetSubregistrySnippet = [
  {
    inputs: [
      { name: 'anyId', type: 'uint256' },
      { name: 'registry', type: 'address' },
    ],
    name: 'setSubregistry',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const userRegistryRegisterSnippet = [
  {
    inputs: [
      { name: 'label', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'registry', type: 'address' },
      { name: 'resolver', type: 'address' },
      { name: 'roleBitmap', type: 'uint256' },
      { name: 'expiry', type: 'uint64' },
    ],
    name: 'register',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const userRegistryRenewSnippet = [
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'expiry', type: 'uint64' },
    ],
    name: 'renew',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const userRegistryUnregisterSnippet = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'unregister',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const userRegistrySetResolverSnippet = [
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'resolver', type: 'address' },
    ],
    name: 'setResolver',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const userRegistryInitializeSnippet = [
  {
    inputs: [
      { name: 'admin', type: 'address' },
      { name: 'roleBitmap', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const userRegistryAllEventsSnippet = [
  ...approvalForAllEventSnippet,
  ...expiryUpdatedEventSnippet,
  ...labelRegisteredEventSnippet,
  ...labelReservedEventSnippet,
  ...labelUnregisteredEventSnippet,
  ...parentUpdatedEventSnippet,
  ...resolverUpdatedEventSnippet,
  ...subregistryUpdatedEventSnippet,
  ...tokenResourceEventSnippet,
  ...transferBatchEventSnippet,
  ...transferSingleEventSnippet,
  ...upgradedEventSnippet,
  ...uriEventSnippet,
] as const
