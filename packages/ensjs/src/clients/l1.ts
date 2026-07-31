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
  'ensEthRenewerV1',

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
    ensEthRenewerV1: {
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
      address: '0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe',
    },
    ensPermissionedResolverImpl: {
      address: '0x9EAe5C2730a7dD16BDD1DeE6421a1B91e3B0365e',
    },
    ensRegistry: {
      address: '0xBDC85dD5b15D7ecb354cd7cb6f2c50b4f2c4F0E2',
    },
    ensVerifiableFactory: {
      address: '0x10dC6333CDFe1FCEf624c6e0a8221b91804Cd7ef',
    },
    ensEthRegistrar: {
      address: '0xa88553F454b77203B0D036A05c894d555EAAa2Cc',
    },
    ensEthRenewerV1: {
      address: '0x4ad56feb5Fc7B8298db06E88fd5CBc41D64602Fa',
    },
    usdc: {
      address: '0x768F42455A2D082E23ceeF7d51e5787C82d67a39',
    },
    dai: {
      address: '0x5472C5725A00B7bA11F0794A79D08ade6F4683bD',
    },
    ensUserRegistryImpl: {
      address: '0x624a25d67B59D587752EbEc8DdeD8827dAe52050',
    },
    ensStandardRentPriceOracle: {
      address: '0x8914b66260EB8C4fff795650c3AE8Cd335958987',
    },
    ensHcaFactory: {
      address: '0x900FF7cF617Ef9D802178B4ef480491e3A782672',
    },
    ensLockedMigrationController: {
      address: '0x5c39E36a69A9897F08954c71aCB1F36E0Bd4f409',
    },
    ensUnlockedMigrationController: {
      address: '0x2FCf83232b93bD29C59dB18AaA1D4b62e9f9FC73',
    },
    ensMigrationHelper: {
      address: '0x1D8c7aA9862F9b823309Ad87A4864Fb27C575e85',
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
      url: 'https://v1-graphql.ens.dev/subgraph',
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
