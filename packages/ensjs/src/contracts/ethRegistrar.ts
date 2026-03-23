export const ethRegistrarNameRegisteredEventSnippet = {
  type: 'event',
  name: 'NameRegistered',
  inputs: [
    { name: 'tokenId', type: 'uint256', indexed: true },
    { name: 'label', type: 'string', indexed: false },
    { name: 'owner', type: 'address', indexed: false },
    { name: 'subregistry', type: 'address', indexed: true },
    { name: 'resolver', type: 'address', indexed: true },
    { name: 'duration', type: 'uint64', indexed: false },
    { name: 'paymentToken', type: 'address', indexed: false },
    { name: 'referrer', type: 'bytes32', indexed: true },
    { name: 'base', type: 'uint256', indexed: false },
    { name: 'premium', type: 'uint256', indexed: false },
  ],
  anonymous: false,
} as const
