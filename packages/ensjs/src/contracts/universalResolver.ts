export const universalResolverErrors = [
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'dns',
        type: 'bytes',
      },
    ],
    name: 'DNSDecodingFailed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'ens',
        type: 'string',
      },
    ],
    name: 'DNSEncodingFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EmptyAddress',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: 'status',
        type: 'uint16',
      },
      {
        internalType: 'string',
        name: 'message',
        type: 'string',
      },
    ],
    name: 'HttpError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidBatchGatewayResponse',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'string[]',
        name: 'urls',
        type: 'string[]',
      },
      {
        internalType: 'bytes',
        name: 'callData',
        type: 'bytes',
      },
      {
        internalType: 'bytes4',
        name: 'callbackFunction',
        type: 'bytes4',
      },
      {
        internalType: 'bytes',
        name: 'extraData',
        type: 'bytes',
      },
    ],
    name: 'OffchainLookup',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'offset',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
    ],
    name: 'OffsetOutOfBoundsError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'errorData',
        type: 'bytes',
      },
    ],
    name: 'ResolverError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'name',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: 'resolver',
        type: 'address',
      },
    ],
    name: 'ResolverNotContract',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'name',
        type: 'bytes',
      },
    ],
    name: 'ResolverNotFound',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'primary',
        type: 'string',
      },
      {
        internalType: 'bytes',
        name: 'primaryAddress',
        type: 'bytes',
      },
    ],
    name: 'ReverseAddressMismatch',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'selector',
        type: 'bytes4',
      },
    ],
    name: 'UnsupportedResolverProfile',
    type: 'error',
  },
] as const

const universalResolverReverse = {
  inputs: [
    {
      internalType: 'bytes',
      name: 'lookupAddress',
      type: 'bytes',
    },
    {
      internalType: 'uint256',
      name: 'coinType',
      type: 'uint256',
    },
  ],
  name: 'reverse',
  outputs: [
    { internalType: 'string', name: 'name', type: 'string' },
    { internalType: 'address', name: 'resolver', type: 'address' },
    { internalType: 'address', name: 'reverseResolver', type: 'address' },
  ],
  stateMutability: 'view',
  type: 'function',
} as const

export const universalResolverReverseSnippet = [
  ...universalResolverErrors,
  universalResolverReverse,
] as const

export const universalResolverReverseWithGatewaysSnippet = [
  ...universalResolverErrors,
  {
    ...universalResolverReverse,
    name: 'reverseWithGateways',
    inputs: [
      ...universalResolverReverse.inputs,
      {
        name: 'gateways',
        type: 'string[]',
      },
    ],
  },
] as const

const universalResolverResolve = {
  inputs: [
    {
      name: 'name',
      type: 'bytes',
    },
    {
      name: 'data',
      type: 'bytes',
    },
  ],
  name: 'resolve',
  outputs: [
    {
      name: 'data',
      type: 'bytes',
    },
    {
      name: 'resolver',
      type: 'address',
    },
  ],
  stateMutability: 'view',
  type: 'function',
} as const

export const universalResolverResolveSnippet = [
  ...universalResolverErrors,
  universalResolverResolve,
] as const

export const universalResolverResolveWithGatewaysSnippet = [
  ...universalResolverErrors,
  {
    ...universalResolverResolve,
    name: 'resolveWithGateways',
    inputs: [
      ...universalResolverResolve.inputs,
      {
        name: 'gateways',
        type: 'string[]',
      },
    ],
  },
] as const

export const universalResolverFindResolverSnippet = [
  ...universalResolverErrors,
  {
    inputs: [
      {
        name: 'name',
        type: 'bytes',
      },
    ],
    name: 'findResolver',
    outputs: [
      {
        name: 'address',
        type: 'address',
      },
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'offset',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// New Universal Resolver ABI snippets:
// [
//   {
//     inputs: [
//       {
//         components: [
//           {
//             components: [
//               { internalType: 'address', name: 'target', type: 'address' },
//               { internalType: 'bytes', name: 'call', type: 'bytes' },
//               { internalType: 'bytes', name: 'data', type: 'bytes' },
//               { internalType: 'uint256', name: 'flags', type: 'uint256' },
//             ],
//             internalType: 'struct CCIPBatcher.Lookup[]',
//             name: 'lookups',
//             type: 'tuple[]',
//           },
//           { internalType: 'string[]', name: 'gateways', type: 'string[]' },
//         ],
//         internalType: 'struct CCIPBatcher.Batch',
//         name: 'batch',
//         type: 'tuple',
//       },
//     ],
//     name: 'ccipBatch',
//     outputs: [
//       {
//         components: [
//           {
//             components: [
//               { internalType: 'address', name: 'target', type: 'address' },
//               { internalType: 'bytes', name: 'call', type: 'bytes' },
//               { internalType: 'bytes', name: 'data', type: 'bytes' },
//               { internalType: 'uint256', name: 'flags', type: 'uint256' },
//             ],
//             internalType: 'struct CCIPBatcher.Lookup[]',
//             name: 'lookups',
//             type: 'tuple[]',
//           },
//           { internalType: 'string[]', name: 'gateways', type: 'string[]' },
//         ],
//         internalType: 'struct CCIPBatcher.Batch',
//         name: '',
//         type: 'tuple',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [],
//     name: 'registry',
//     outputs: [{ internalType: 'contract ENS', name: '', type: 'address' }],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [{ internalType: 'bytes', name: 'name', type: 'bytes' }],
//     name: 'requireResolver',
//     outputs: [
//       {
//         components: [
//           { internalType: 'bytes', name: 'name', type: 'bytes' },
//           { internalType: 'uint256', name: 'offset', type: 'uint256' },
//           { internalType: 'bytes32', name: 'node', type: 'bytes32' },
//           { internalType: 'address', name: 'resolver', type: 'address' },
//           { internalType: 'bool', name: 'extended', type: 'bool' },
//         ],
//         internalType: 'struct AbstractUniversalResolver.ResolverInfo',
//         name: 'info',
//         type: 'tuple',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       { internalType: 'bytes', name: 'response', type: 'bytes' },
//       { internalType: 'bytes', name: 'extraData', type: 'bytes' },
//     ],
//     name: 'resolveBatchCallback',
//     outputs: [],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       { internalType: 'bytes', name: 'response', type: 'bytes' },
//       { internalType: 'bytes', name: 'extraData', type: 'bytes' },
//     ],
//     name: 'resolveCallback',
//     outputs: [
//       { internalType: 'bytes', name: '', type: 'bytes' },
//       { internalType: 'address', name: '', type: 'address' },
//     ],
//     stateMutability: 'pure',
//     type: 'function',
//   },
//   {
//     inputs: [
//       { internalType: 'bytes', name: 'response', type: 'bytes' },
//       { internalType: 'bytes', name: 'extraData', type: 'bytes' },
//     ],
//     name: 'resolveDirectCallback',
//     outputs: [],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       { internalType: 'bytes', name: 'response', type: 'bytes' },
//       { internalType: 'bytes', name: '', type: 'bytes' },
//     ],
//     name: 'resolveDirectCallbackError',
//     outputs: [],
//     stateMutability: 'pure',
//     type: 'function',
//   },
//   {
//     inputs: [
//       { internalType: 'address', name: 'resolver', type: 'address' },
//       { internalType: 'bytes', name: 'name', type: 'bytes' },
//       { internalType: 'bytes', name: 'data', type: 'bytes' },
//       { internalType: 'string[]', name: 'gateways', type: 'string[]' },
//     ],
//     name: 'resolveWithResolver',
//     outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       { internalType: 'bytes', name: 'response', type: 'bytes' },
//       { internalType: 'bytes', name: 'extraData', type: 'bytes' },
//     ],
//     name: 'reverseAddressCallback',
//     outputs: [
//       { internalType: 'string', name: 'primary', type: 'string' },
//       { internalType: 'address', name: 'resolver', type: 'address' },
//       { internalType: 'address', name: 'reverseResolver', type: 'address' },
//     ],
//     stateMutability: 'pure',
//     type: 'function',
//   },
//   {
//     inputs: [
//       { internalType: 'bytes', name: 'response', type: 'bytes' },
//       { internalType: 'bytes', name: 'extraData', type: 'bytes' },
//     ],
//     name: 'reverseNameCallback',
//     outputs: [
//       { internalType: 'string', name: 'primary', type: 'string' },
//       { internalType: 'address', name: '', type: 'address' },
//       { internalType: 'address', name: '', type: 'address' },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
// ]
