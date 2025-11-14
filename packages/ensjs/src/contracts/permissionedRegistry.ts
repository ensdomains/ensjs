export const registryGetNameDataSnippet = [
  {
    inputs: [
      { internalType: 'string', name: 'label', type: 'string' },
    ],
    name: 'getNameData',
    outputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      {
        internalType: 'struct IRegistryDatastore.Entry',
        name: 'entry',
        type: 'tuple',
        components: [
          { internalType: 'uint64', name: 'expiry',        type: 'uint64' },
          { internalType: 'uint32', name: 'tokenVersionId', type: 'uint32' },
          { internalType: 'address', name: 'subregistry',   type: 'address' },
          { internalType: 'uint32', name: 'eacVersionId',   type: 'uint32' },
          { internalType: 'address', name: 'resolver',      type: 'address' },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const