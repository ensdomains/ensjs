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
    ensUniversalResolver: {
      address: '0x5a9236e72a66d3e08b83dcf489b4d850792b6009',
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
      address: zeroAddress,
    },
    dai: {
      address: zeroAddress,
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
      address: '0x7f86d816165baf4fd68bfd9a0706601cdd666ac4',
    },
    ensLegacyDnsRegistrar: {
      address: '0x5a07C75Ae469Bf3ee2657B588e8E6ABAC6741b4f',
    },
    ensLegacyDnssecImpl: {
      address: '0xe62E4b6cE018Ad6e916fcC24545e20a33b9d8653',
    },
    ensEthRegistrarController: {
      address: '0xfb3ce5d01e0f33f41dbb39035db9745962f1f968',
    },
    ensNameWrapper: {
      address: '0x0635513f179D50A207757E05759CbD106d7dFcE8',
    },
    ensPublicResolver: {
      address: '0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5',
    },
    ensLegacyRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensReverseRegistrar: {
      address: '0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6',
    },
    ensUniversalResolver: {
      address: '0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe',
    },
    ensPermissionedResolverImpl: {
      address: '0xdce5205a553573ffd47629327dddf36186022ffa',
    },
    ensRegistry: {
      address: '0xdedb92913a25abe1f7bcdd85d8a344a43b398b67',
    },
    ensVerifiableFactory: {
      address: '0xd2a632d8a8b67c2c4398c255cbd7af8dd7236198',
    },
    ensEthRegistrar: {
      address: '0x8c2e866b439358c41ae05de9cbe8a00bfefaffca',
    },
    usdc: {
      address: '0x3dfc8b53dafa5ebbb071a8b97678ab534ed838d9',
    },
    dai: {
      address: '0xa4e569b57e0d6ac518c73ebdaa67e11c96dbd7a4',
    },
    ensUserRegistryImpl: {
      address: '0x0f99e7ea74903afcb7224d0354fd7428a6f92917',
    },
    ensStandardRentPriceOracle: {
      address: '0xf33d548997e2975c8ff04f66219564d8c7a95e26',
    },
    ensHcaFactory: {
      address: '0x4327e31b4111dc0fb54517cd0fed82680840f32e',
    },
    ensLockedMigrationController: {
      address: '0xf91c34ed840889ed96f806f882fd50506a336edb',
    },
    ensUnlockedMigrationController: {
      address: '0x056138ef5660f7113a3b0adc08ac3683310e7fbc',
    },
    ensMigrationHelper: {
      address: '0x11cfa7e034dafb7439cc1cc8b6e547f5c82ad021',
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
      url: 'https://ensnode-api-sepolia.up.railway.app/subgraph',
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
