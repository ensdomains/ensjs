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
  'ensDefaultReverseRegistrar',
  'ensDefaultReverseRegistrarAdapter',
  'ensReverseRegistrarAdapter',
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
  // Registry-walking views (findExactOwner / findRegistries /
  // findParentRegistry). These used to be on the UR, which now only keeps
  // `findResolver`.
  'ensUniversalHelper',
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
    ensDefaultReverseRegistrar: {
      address: zeroAddress,
    },
    ensDefaultReverseRegistrarAdapter: {
      address: zeroAddress,
    },
    ensReverseRegistrarAdapter: {
      address: zeroAddress,
    },
    ensUniversalResolver: {
      address: '0x5a9236e72a66D3e08B83dcf489B4d850792B6009',
    },
    ensUniversalHelper: {
      address: zeroAddress,
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
    // The V1 PublicResolver. Only V1 actions read this key (dns/importDnsName,
    // wallet/v1/{setPrimaryName,createSubname,wrapName}), and they pass it as a
    // resolver for the V1 registry — so it must implement the legacy `addr`
    // interface. The V2 public resolver does not, and belongs under its own key.
    ensPublicResolver: {
      address: '0x8FADE66B79cC9f707aB26799354482EB93a5B7dD',
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
    // ENSIP-19 `default.reverse`: sets the primary name per coin type.
    ensDefaultReverseRegistrar: {
      address: '0x4F382928805ba0e23B30cFB75fC9E848e82DFD47',
    },
    // HCA forwarders for the two reverse registrars. Each resolves the calling
    // account's owner through `ensHcaFactory`, and its wrapped registrar is
    // readable on-chain: the default adapter's DEFAULT_REVERSE_REGISTRAR is
    // `ensDefaultReverseRegistrar`, and the other adapter's REVERSE_REGISTRAR
    // is `ensReverseRegistrar`.
    ensDefaultReverseRegistrarAdapter: {
      address: '0x36f97328e843e37520cbF530e9402791c2754066',
    },
    ensReverseRegistrarAdapter: {
      address: '0x56Bce5E727FAa9D237341Bb5B9E8a03D5919779d',
    },
    ensUniversalResolver: {
      address: '0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe',
    },
    ensUniversalHelper: {
      address: '0xd453e5Bdb62CC3beA84341B1e306319C8Ffd7DFe',
    },
    ensPermissionedResolverImpl: {
      address: '0x115eb53F0c60696633855F90b138178Fb40b2b2C',
    },
    ensRegistry: {
      address: '0xD4eBcbBdF463C9c45784603Db0dDD499BC44A8B4',
    },
    ensVerifiableFactory: {
      address: '0xDa70306C98E97eCe36F997a21368e53298572991',
    },
    ensEthRegistrar: {
      address: '0xf633e7FC17e2bbE0D0965D18ec1821dcB754a3d3',
    },
    ensEthRenewerV1: {
      address: '0xf2ece44980778966b8a0FccB3A9E339440f6e045',
    },
    usdc: {
      address: '0x240b0316Df57887DBBE58b586508b19e633a14aa',
    },
    dai: {
      address: '0xF6faC8A58a0BE13b9197f27C41B73162Fe32572b',
    },
    ensUserRegistryImpl: {
      address: '0x9BD8a88719068D09ecee662f36C0E3856708366a',
    },
    ensStandardRentPriceOracle: {
      address: '0x8196665D4ca7488B6474a9EC8E7d2719FB42263A',
    },
    ensHcaFactory: {
      address: '0x6Bad0176236e97b346B5Dd13BCc8325B931EE8ab',
    },
    ensLockedMigrationController: {
      address: '0x6029a063d69b09D23c52a754a90E4FE43aDac3A8',
    },
    ensUnlockedMigrationController: {
      address: '0x2a35B94DF22cc7354570be2284655E2CDC0e64A2',
    },
    ensMigrationHelper: {
      address: '0xA8F86EE5cdD28703bd876F3a8c10B1DE70f36899',
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
