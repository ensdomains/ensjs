import { eacGrantInitializeSnippet } from './enhancedAccessControl.js'

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
 * The initializer a subregistry (`UserRegistry`) proxy takes:
 * `initialize(Grant[] grants)`. Re-exported from the access-control module —
 * every `EnhancedAccessControl` proxy shares it.
 */
export const subregistryInitializeSnippet = eacGrantInitializeSnippet

/**
 * The default initializer `deployVerifiableProxy` encodes when the caller
 * supplies no explicit `callData`: `initialize(Grant[] grants)`.
 *
 * A `PermissionedResolver` proxy does NOT use this — its initializer takes a
 * trailing `bytes[] calls`. Use `permissionedResolverInitializeSnippet` from
 * `@ensdomains/ensjs-abi/v2/permissionedResolver` for those.
 */
export const proxyInitializeSnippet = eacGrantInitializeSnippet

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
