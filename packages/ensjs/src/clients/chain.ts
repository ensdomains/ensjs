import {
  type Account,
  type Chain,
  type ChainContract,
  type Client,
  createPublicClient,
  http,
  type Prettify,
  type Transport,
  getChainContractAddress as viem_getChainContractAddress,
} from 'viem'
import { mainnet } from 'viem/chains'
import type {
  StringConcatenationOrder,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: yes
  TypeError,
} from '../types/internal.js'

// ================================
// Supported chains
// ================================

export const supportedChains = {
  mainnet: 1,
  goerli: 5,
  holesky: 17000,
  sepolia: 11155111,
} as const

const supportedChainIds = Object.values(supportedChains)

export type SupportedChainId =
  (typeof supportedChains)[keyof typeof supportedChains]

export type AnySupportedChain = Omit<Chain, 'id'> & {
  id: SupportedChainId
}

// ================================
// Supported contracts
// ================================

export const supportedContracts = [
  'ensBaseRegistrarImplementation',
  'ensBulkRenewal',
  'ensDnsRegistrar',
  'ensDnssecImpl',
  'ensEthRegistrarController',
  'ensNameWrapper',
  'ensPublicResolver',
  'ensRegistry',
  'ensReverseRegistrar',
  'ensUniversalResolver',
] as const

export type SupportedContract = (typeof supportedContracts)[number]

export const ensContracts = {
  [supportedChains.mainnet]: {
    ensBaseRegistrarImplementation: {
      address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
    },
    ensBulkRenewal: {
      address: '0xa12159e5131b1eEf6B4857EEE3e1954744b5033A',
    },
    ensDnsRegistrar: {
      address: '0xB32cB5677a7C971689228EC835800432B339bA2B',
    },
    ensDnssecImpl: {
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
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensReverseRegistrar: {
      address: '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb',
    },
    ensUniversalResolver: {
      address: '0xce01f8eee7E479C928F8919abD53E553a36CeF67',
    },
  },
  [supportedChains.goerli]: {
    ensBaseRegistrarImplementation: {
      address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
    },
    ensBulkRenewal: {
      address: '0x6d9F26FfBcF1c6f0bAe9F2C1f7fBe8eE6B1d8d4d',
    },
    ensDnsRegistrar: {
      address: '0x8edc487D26F6c8Fa76e032066A3D4F87E273515d',
    },
    ensDnssecImpl: {
      address: '0xF427c4AdED8B6dfde604865c1a7E953B160C26f0',
    },
    ensEthRegistrarController: {
      address: '0xCc5e7dB10E65EED1BBD105359e7268aa660f6734',
    },
    ensNameWrapper: {
      address: '0x114D4603199df73e7D157787f8778E21fCd13066',
    },
    ensPublicResolver: {
      address: '0xd7a4F6473f32aC2Af804B3686AE8F1932bC35750',
    },
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensReverseRegistrar: {
      address: '0x6d9F26FfBcF1c6f0bAe9F2C1f7fBe8eE6B1d8d4d',
    },
    ensUniversalResolver: {
      address: '0x898A1182F3C2BBBF0b16b4DfEf63E9c3e9eB4821',
    },
  },
  [supportedChains.holesky]: {
    ensBaseRegistrarImplementation: {
      address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
    },
    ensBulkRenewal: {
      address: '0xbc4cfB363F948E64Cd73Da6438F64CB37E2e33d1',
    },
    ensDnsRegistrar: {
      address: '0x458d278AEd4cE82BAeC384170f39198b01B8351c',
    },
    ensDnssecImpl: {
      address: '0x283af0b28c62c092c9727f1ee09c02ca627eb7f5',
    },
    ensEthRegistrarController: {
      address: '0x179Be112b24Ad4cFC392eF8924DfA08C20Ad8583',
    },
    ensNameWrapper: {
      address: '0xab50971078225D365994dc1Edcb9b7FD72Bb4862',
    },
    ensPublicResolver: {
      address: '0x9010A27463717360cAD99CEA8bD39b8705CCA238',
    },
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensReverseRegistrar: {
      address: '0x132AC0B116a73add4225029D1951A9A707Ef673f',
    },
    ensUniversalResolver: {
      address: '0xa6ac935d4971e3cd133b950ae053becd16fe7f3b',
    },
  },
  [supportedChains.sepolia]: {
    ensBaseRegistrarImplementation: {
      address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
    },
    ensBulkRenewal: {
      address: '0x4EF77b90762Eddb33C8Eba5B5a19558DaE53D7a1',
    },
    ensDnsRegistrar: {
      address: '0x5a07C75Ae469Bf3ee2657B588e8E6ABAC6741b4f',
    },
    ensDnssecImpl: {
      address: '0xe62E4b6cE018Ad6e916fcC24545e20a33b9d8653',
    },
    ensEthRegistrarController: {
      address: '0xFED6a969AaA60E4961FCD3EBF1A2e8913ac65B72',
    },
    ensNameWrapper: {
      address: '0x0635513f179D50A207757E05759CbD106d7dFcE8',
    },
    ensPublicResolver: {
      address: '0x8FADE66B79cC9f707aB26799354482EB93a5B7dD',
    },
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensReverseRegistrar: {
      address: '0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6',
    },
    ensUniversalResolver: {
      address: '0xc8af999e38273d658be1b921b88a9ddf005769cc',
    },
  },
} as const satisfies Record<
  SupportedChainId,
  Record<SupportedContract, ChainContract>
>

// ================================
// Supported subgraphs
// ================================

type EnsSubgraph = {
  ens: {
    url: string
  }
}

export const ensSubgraphs = {
  [supportedChains.mainnet]: {
    ens: {
      url: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
    },
  },
  [supportedChains.goerli]: {
    ens: {
      url: 'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli',
    },
  },
  [supportedChains.holesky]: {
    ens: {
      url: 'https://api.studio.thegraph.com/query/49574/ensholesky/version/latest',
    },
  },
  [supportedChains.sepolia]: {
    ens: {
      url: 'https://api.studio.thegraph.com/query/49574/enssepolia/version/latest',
    },
  },
} as const satisfies Record<SupportedChainId, EnsSubgraph>

// ================================
// Contracts
// ================================

export type BaseChainContracts = {
  [key in keyof NonNullable<Chain['contracts']> as string extends key
    ? never
    : key]: NonNullable<Chain['contracts']>[key]
}

type SuggestedContracts =
  | SupportedContract
  | keyof BaseChainContracts
  | (string & {})

export type ExtractContracts<chain extends Chain> = NonNullable<
  chain extends {
    contracts?: infer C
  }
    ? //   ? C
      {
        [key in keyof C as string extends key ? never : key]: C[key] extends
          | ChainContract
          | undefined
          ? C[key]
          : C[key] extends { [sourceId: number]: ChainContract | undefined }
            ? C[key][keyof C[key]]
            : never
      }
    : never
>

// ================================
// Assertions
// ================================

type AssertSupportedChain<chain extends Chain> = chain extends AnySupportedChain
  ? chain
  : TypeError<`${chain['name']} is not a supported chain, supported chains are: ${StringConcatenationOrder<keyof typeof supportedChains, ', '>}`>

export type ChainWithEns<chain extends AnySupportedChain = AnySupportedChain> =
  chain & {
    contracts: (typeof ensContracts)[chain['id']]
    subgraphs: (typeof ensSubgraphs)[chain['id']]
  }

export const extendChainWithEns = <const chain extends Chain>(
  chain: AssertSupportedChain<chain>,
): ChainWithEns<Extract<chain, AnySupportedChain>> => {
  const initial = chain as AnySupportedChain

  if (!supportedChainIds.includes(initial.id)) {
    throw new Error(`Chain ${initial.name} is not supported`)
  }

  return {
    ...initial,
    contracts: {
      ...initial.contracts,
      ...ensContracts[initial.id],
    },
    subgraphs: {
      ...('subgraphs' in initial && typeof initial.subgraphs === 'object'
        ? initial.subgraphs
        : {}),
      ...ensSubgraphs[initial.id],
    },
  } as ChainWithEns<Extract<chain, AnySupportedChain>>
}

/**
 * Type utility that explicitly enforces the presence of required contracts on the chain
 */
export type ChainWithContracts<
  contracts extends SuggestedContracts,
  chain extends Chain = Chain,
> = chain & {
  contracts: {
    [key in contracts]: ChainContract
  }
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
> = chain extends Chain & {
  contracts: {
    [key in contracts]: ChainContract
  }
}
  ? chain
  : TypeError<`Chain "${chain['name']}" is missing required contracts: ${StringConcatenationOrder<contracts, ', '>}`>
// : TypeError<`Chain "${chain["name"]}" is missing required contracts: ${StringConcatenationOrder<Exclude<contracts, keyof ExtractContracts<chain>>, ", ">}`>;

/**
 * Type utility that enforces required contract dependencies on the client while providing clear error messages
 * @example
 * ```ts
 * // Action definition
 * const myAction = async <chain extends Chain>(
 *   client: RequireClientContracts<chain, 'ensPublicResolver'>,
 * ) => { ... }
 *
 * // Example clients
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const clientWithEnsContracts = createPublicClient({
 *   // This adds the required contracts to the chain
 *   chain: extendChainWithEns(mainnet),
 *   transport: http(),
 * })
 *
 * // This will error
 * myAction(client) // TypeError<'Chain "mainnet" is missing required contracts: ensPublicResolver'>
 *
 * // This will not error
 * myAction(clientWithEnsContracts)
 * ```
 */
export type RequireClientContracts<
  chain extends Chain,
  contracts extends SuggestedContracts,
  account extends Account | undefined = Account | undefined,
> = chain extends Chain & {
  contracts: {
    [key in contracts]: ChainContract
  }
}
  ? Client<Transport, chain, account>
  : TypeError<`Chain "${chain['name']}" is missing required contracts: ${StringConcatenationOrder<contracts, ', '>}`>

/**
 * @see {viem_getChainContractAddress}
 */
export const getChainContractAddress = <
  const chain extends Chain,
  contracts extends ExtractContracts<chain> = ExtractContracts<chain>,
  contract extends keyof contracts = keyof contracts,
>({
  blockNumber,
  chain,
  contract,
}: {
  blockNumber?: bigint | undefined
  chain: chain
  contract: contract
}) =>
  viem_getChainContractAddress({
    chain,
    contract: contract as string,
    blockNumber,
  }) as contracts[contract] extends ChainContract
    ? contracts[contract]['address']
    : never
