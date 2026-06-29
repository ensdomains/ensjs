import { type Chain, type ChainContract, zeroAddress } from 'viem'
import type {
  StringConcatenationOrder,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: yes
  TypeError,
} from '../types/internal.js'
import type { AssertSupportedChain, SuggestedContracts } from './shared.js'

// ================================
// Supported chains
// ================================

export const supportedL1Chains = {
  mainnet: 1,
  sepolia: 11155111,
} as const

const SupportedL1ChainIds = Object.values(supportedL1Chains)

export type SupportedL1ChainId =
  (typeof supportedL1Chains)[keyof typeof supportedL1Chains]

export type AnySupportedL1Chain = Omit<Chain, 'id'> & {
  id: SupportedL1ChainId
}

// ================================
// Supported contracts
// ================================

export const supportedL1Contracts = [
  // v1
  'ensBaseRegistrarImplementation',
  'ensBulkRenewal',
  'ensLegacyDnsRegistrar',
  'ensLegacyDnssecImpl',
  'ensEthRegistrarController',
  'ensNameWrapper',
  'ensPublicResolver',
  'ensLegacyRegistry',
  'ensReverseRegistrar',
  'ensDefaultReverseResolver',

  // v2
  'ensEthRegistrar',
  'usdc',
  'dai',
  'ensVerifiableFactory',
  'ensRegistry',
  'ensPermissionedResolverImpl',
  'ensUserRegistryImpl',
  'ensStandardRentPriceOracle',
  'ensHcaFactory',
  'ensLockedMigrationController',
  'ensUnlockedMigrationController',
  'ensMigrationHelper',

  // UR
  'ensUniversalResolver',
] as const

export type SupportedL1Contract = (typeof supportedL1Contracts)[number]

export const ensL1Contracts = {
  [supportedL1Chains.mainnet]: {
    ensBaseRegistrarImplementation: {
      address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
    },
    ensBulkRenewal: {
      address: '0xa12159e5131b1eEf6B4857EEE3e1954744b5033A',
    },
    ensLegacyDnsRegistrar: {
      address: '0xB32cB5677a7C971689228EC835800432B339bA2B',
    },
    ensLegacyDnssecImpl: {
      address: '0x0fc3152971714E5ed7723FAFa650F86A4BaF30C5',
    },
    ensEthRegistrarController: {
      address: '0x253553366Da8546fC250F225fe3d25d0C782303b',
    },
    ensNameWrapper: {
      address: '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401',
    },
    ensPublicResolver: {
      address: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
    },
    ensLegacyRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensReverseRegistrar: {
      address: '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb',
    },
    ensDefaultReverseResolver: {
      address: zeroAddress,
    },
    ensUniversalResolver: {
      address: '0x5a9236e72a66D3e08B83dcf489B4d850792B6009',
    },
    ensPermissionedResolverImpl: {
      address: zeroAddress,
    },
    ensRegistry: {
      address: zeroAddress,
    },
    ensVerifiableFactory: {
      address: zeroAddress,
    },
    ensEthRegistrar: {
      address: zeroAddress,
    },
    usdc: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    dai: {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
    ensUserRegistryImpl: {
      address: zeroAddress,
    },
    ensStandardRentPriceOracle: {
      address: zeroAddress,
    },
    ensHcaFactory: {
      address: zeroAddress,
    },
    ensLockedMigrationController: {
      address: zeroAddress,
    },
    ensUnlockedMigrationController: {
      address: zeroAddress,
    },
    ensMigrationHelper: {
      address: zeroAddress,
    },
  },
  [supportedL1Chains.sepolia]: {
    ensBaseRegistrarImplementation: {
      address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
    },
    ensBulkRenewal: {
      address: '0x7f86d816165BaF4fD68bFd9A0706601cDD666ac4',
    },
    ensLegacyDnsRegistrar: {
      address: '0x5a07C75Ae469Bf3ee2657B588e8E6ABAC6741b4f',
    },
    ensLegacyDnssecImpl: {
      address: '0xe62E4b6cE018Ad6e916fcC24545e20a33b9d8653',
    },
    ensEthRegistrarController: {
      address: '0xfb3cE5D01e0f33f41DbB39035dB9745962F1f968',
    },
    ensNameWrapper: {
      address: '0x0635513f179D50A207757E05759CbD106d7dFcE8',
    },
    ensPublicResolver: {
      address: '0x5239A812ec9A62F46dbb5de8f346C8eFe7553A9f',
    },
    ensLegacyRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensReverseRegistrar: {
      address: '0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6',
    },
    ensDefaultReverseResolver: {
      address: '0x7cD0016F722f34394110738eEc10265b00c6C7d9',
    },
    ensUniversalResolver: {
      address: '0x2f8a180604c42457cb56c7c4f708748ff1f91df1',
    },
    ensPermissionedResolverImpl: {
      address: '0xdcE5205A553573FFd47629327DDdf36186022FfA',
    },
    ensRegistry: {
      address: '0xDEDB92913A25abE1f7BCDD85D8A344a43B398B67',
    },
    ensVerifiableFactory: {
      address: '0xD2a632D8a8b67c2c4398c255CbD7aF8dd7236198',
    },
    ensEthRegistrar: {
      address: '0x8c2E866B439358c41AE05De9cbE8A00BFEFafFcA',
    },
    usdc: {
      address: '0xBA11ebdB3f9a2c5946D8629517f06364E53A2E10',
    },
    dai: {
      address: '0x2922bCD677Af690fCD1eCC699519e4bfaBc73fF8',
    },
    ensUserRegistryImpl: {
      address: '0x0F99e7Ea74903AfCB7224d0354fD7428A6f92917',
    },
    ensStandardRentPriceOracle: {
      address: '0xe19D37839F42F7d2694D8C5712f412C66A218161',
    },
    ensHcaFactory: {
      address: '0x358680728dEDb552adaA9f5eb5d4395B291Cf943',
    },
    ensLockedMigrationController: {
      address: '0xF91c34ED840889Ed96F806f882fD50506A336Edb',
    },
    ensUnlockedMigrationController: {
      address: '0x056138Ef5660F7113a3B0ADC08ac3683310e7FBC',
    },
    ensMigrationHelper: {
      address: '0x11Cfa7E034DaFB7439cC1CC8b6e547F5C82ad021',
    },
  },
} as const satisfies Record<
  SupportedL1ChainId,
  Record<SupportedL1Contract, ChainContract>
>

// ================================
// Supported subgraphs
// ================================

type EnsSubgraph = {
  ens: {
    url: string
  }
}

export type ChainWithSubgraph = { subgraphs: EnsSubgraph }

export const ensL1Subgraphs = {
  [supportedL1Chains.mainnet]: {
    ens: {
      url: 'https://api.alpha.blue.ensnode.io/subgraph',
    },
  },
  [supportedL1Chains.sepolia]: {
    ens: {
      url: 'https://api.sepolia.ensnode.io/subgraph',
    },
  },
} as const satisfies Record<SupportedL1ChainId, EnsSubgraph>

// ================================
// Contracts
// ================================

// ================================
// Assertions
// ================================

export type ChainWithEns<
  chain extends AnySupportedL1Chain = AnySupportedL1Chain,
> = Omit<chain, 'contracts' | 'subgraphs'> & {
  contracts: Omit<
    chain['contracts'],
    keyof (typeof ensL1Contracts)[chain['id']]
  > &
    (typeof ensL1Contracts)[chain['id']]
  subgraphs: (typeof ensL1Subgraphs)[chain['id']]
}

export const extendChainWithEns = <const chain extends Chain>(
  chain: AssertSupportedChain<
    chain,
    AnySupportedL1Chain,
    typeof supportedL1Chains
  >,
): ChainWithEns<Extract<chain, AnySupportedL1Chain>> => {
  const initial = chain as AnySupportedL1Chain

  if (!SupportedL1ChainIds.includes(initial.id)) {
    throw new Error(`Chain ${initial.name} is not supported`)
  }

  return {
    ...initial,
    contracts: {
      ...initial.contracts,
      ...ensL1Contracts[initial.id],
    },
    subgraphs: {
      ...('subgraphs' in initial && typeof initial.subgraphs === 'object'
        ? initial.subgraphs
        : {}),
      ...ensL1Subgraphs[initial.id],
    },
  } as ChainWithEns<Extract<chain, AnySupportedL1Chain>>
}

/**
 * Type utility that enforces required contract dependencies on the chain while providing clear error messages
 * @example
 * ```ts
 * // Action definition
 * const myAction = async <chain extends Chain>(
 *   chain: RequireChainContracts<chain, 'ensPublicResolver'>,
 * ) => { ... }
 *
 * // Will error
 * myAction(mainnet) // TypeError<'Chain "mainnet" is missing required contracts: ensPublicResolver'>
 *
 * // Will not error
 * myAction(extendChainWithEns(mainnet))
 * ```
 */
export type RequireChainContracts<
  chain extends Chain,
  contracts extends SuggestedContracts,
> = chain extends Omit<Chain, 'contracts'> & {
  contracts: {
    [key in contracts]: ChainContract
  }
}
  ? chain
  : TypeError<`Chain "${chain['name']}" is missing required contracts: ${StringConcatenationOrder<contracts, ', '>}`>
// : TypeError<`Chain "${chain["name"]}" is missing required contracts: ${StringConcatenationOrder<Exclude<contracts, keyof ExtractContracts<chain>>, ", ">}`>;
