export const registryGetSubregistrySnippet = [
  {
    name: 'getSubregistry',
    inputs: [{ name: 'label', type: 'string' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const registryOwnerOfSnippet = [
  {
    name: 'ownerOf',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ name: 'owner', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
