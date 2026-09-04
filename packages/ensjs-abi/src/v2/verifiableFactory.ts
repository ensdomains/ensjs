export const verifiableFactoryErrors = [] as const

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
    type: 'event',
    anonymous: false,
  },
] as const

/**
 * `IEACGrantInitializable.initialize(Grant[] grants)`: the initializer of
 * `UserRegistry` proxies since contracts-v2 `post-audit-2` (PR #405). Each
 * grant is `{ account, roleBitmap }` applied on the root resource.
 */
export const eacGrantInitializeSnippet = [
  {
    inputs: [
      {
        name: 'grants',
        type: 'tuple[]',
        components: [
          { name: 'account', type: 'address' },
          { name: 'roleBitmap', type: 'uint256' },
        ],
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

/** Alias of {@link eacGrantInitializeSnippet} for subregistry (`UserRegistry`) proxies. */
export const subregistryInitializeSnippet = eacGrantInitializeSnippet

/**
 * @deprecated The `initialize(address admin, uint256 roleBitmap)` form was
 * removed in contracts-v2 `post-audit-2`. Use {@link eacGrantInitializeSnippet}
 * for registries and `permissionedResolverInitializeSnippet` for resolvers.
 */
export const proxyInitializeSnippet = [
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

export const verifiableFactoryProxyLogicSnippet = [
  {
    inputs: [],
    name: 'proxyLogic',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const verifiableFactoryVerifyContractSnippet = [
  {
    inputs: [
      { name: 'proxy', type: 'address' },
      { name: 'implementation', type: 'address' },
    ],
    name: 'verifyContract',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
