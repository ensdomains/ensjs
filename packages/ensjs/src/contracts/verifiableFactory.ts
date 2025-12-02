export const verifiableFactoryErrors = [
  {
    inputs: [],
    name: 'FailedCall',
    type: 'error',
  },
  {
    inputs: [
      {
        name: 'roleBitmap',
        type: 'uint256',
      },
    ],
    name: 'EACInvalidRoleBitmap',
    type: 'error',
  },
] as const

export const verifiableFactoryDeployProxySnippet = [
  ...verifiableFactoryErrors,
  {
    inputs: [
      {
        name: 'implementation',
        type: 'address',
      },
      {
        name: 'salt',
        type: 'uint256',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'deployProxy',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        indexed: true,
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        name: 'proxyAddress',
        type: 'address',
      },
      {
        indexed: false,
        name: 'salt',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'ProxyDeployed',
    anonymous: false,
    type: 'event',
  },
] as const

export const proxyDeployedEventSnippet = [
  {
    inputs: [
      {
        indexed: true,
        name: 'sender',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: true,
        name: 'proxyAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: false,
        name: 'salt',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        indexed: false,
        name: 'implementation',
        type: 'address',
        internalType: 'address',
      },
    ],
    name: 'ProxyDeployed',
    type: 'event',
    anonymous: false,
  },
] as const

export const subregistryInitializeSnippet = [
  {
    inputs: [
      {
        name: 'admin',
        type: 'address',
      },
      {
        name: 'roleBitmap',
        type: 'uint256',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const proxyInitializeSnippet = [
  {
    inputs: [
      {
        name: 'admin',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
