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
      address: '0x48F94806C22F60A9C4757ef09889F3Ce6546bd2F',
    },
    ensBulkRenewal: {
      address: '0x38d7f0B8a38E4FbcA5Da460244176FaB03Dabd03',
    },
    ensLegacyDnsRegistrar: {
      address: '0x3CB8b156Cc07c7D13d622B816828Fc8B70EEf0C6',
    },
    ensLegacyDnssecImpl: {
      address: '0x023Af42Fa64C4195cb560e8a7CE4F8f0e778636A',
    },
    ensEthRegistrarController: {
      address: '0x6E5a9D17A226af1489c15042eD407651607B7e86',
    },
    ensNameWrapper: {
      address: '0x293268DEBf3176B464EC2C67090dd6e343b28b73',
    },
    ensPublicResolver: {
      address: '0xaec512a71de820A57DC2aafc197a743D035b82df',
    },
    ensLegacyRegistry: {
      address: '0x82080Cc8ca78597BdE586A003D0a080c79a1814B',
    },
    ensReverseRegistrar: {
      address: '0x060D5a54a8751eEc63B756E32Ef66f5eEf418e60',
    },
    ensDefaultReverseResolver: {
      address: '0x5Eba5daa84077971f6C832b33c77AC387a533C05',
    },
    ensUniversalResolver: {
      address: '0xd26f2040D083Af1cD2962ba303F4BEa0c4faf142',
    },
    ensPermissionedResolverImpl: {
      address: '0xa9d3814AB151BF6E37A427432795371a8361614e',
    },
    ensRegistry: {
      address: '0x1D78834d97c1D7b1A38c1deDBD1a287cFEd3971e',
    },
    ensVerifiableFactory: {
      address: '0x894bc9cC8ff1ad96B8a288C86A8C71D662C07780',
    },
    ensEthRegistrar: {
      address: '0x7d1B7f586a62Ac3F54b9A396849757814283270b',
    },
    ensEthRenewerV1: {
      address: '0x47Bc0ab8F87db01383255e564ccE92956ECC7C70',
    },
    usdc: {
      address: '0xcBFD80F74375c54E545AF34788Ff465F96F66F05',
    },
    dai: {
      address: '0x93403a98c3A6be906585CD0D68447c0Fc600FB38',
    },
    ensUserRegistryImpl: {
      address: '0x47B442d0CF617c41CAbAFf5f02f44DD1e5f72546',
    },
    ensStandardRentPriceOracle: {
      address: '0xFeba6589b5C1B35875C0389CCEDF83148B6eE71B',
    },
    ensHcaFactory: {
      address: '0xb85152A8EF4dB5CaF37Af6bffce66B559a9C0B58',
    },
    ensLockedMigrationController: {
      address: '0x7fa65c83Dd80Cca2Fbd91e16a6dc4F66B64eFE22',
    },
    ensUnlockedMigrationController: {
      address: '0x97494264AD5437611CC2f43987c21F6F352D786a',
    },
    ensMigrationHelper: {
      address: '0x540f222a6FD9A54E77989556f366940d1ad81aec',
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
