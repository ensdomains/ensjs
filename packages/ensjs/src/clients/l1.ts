import { type Account, type Chain, type ChainContract, zeroAddress } from 'viem'
import type {
  StringConcatenationOrder,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: yes
  TypeError,
} from '../types/internal.js'
import {
  type AssertSupportedChain,
  type ChainWithContracts,
  type RequireClientContracts,
  type SuggestedContracts,
  supportedNamechainContracts,
} from './shared.js'

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
  ...supportedNamechainContracts,

  // v1
  'ensBaseRegistrarImplementation',
  'ensBulkRenewal',
  'ensDnsRegistrar',
  'ensDnssecImpl',
  'ensEthRegistrarController',
  'ensNameWrapper',
  'ensPublicResolver',
  'ensRegistry',
  'ensReverseRegistrar',

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
      address: '0x5a9236e72a66d3e08b83dcf489b4d850792b6009',
    },
    ensDedicatedResolver: {
      address: zeroAddress,
    },
    ensV2EthRegistry: {
      address: zeroAddress,
    },
    ensUserRegistry: {
      address: zeroAddress,
    },
    ensVerifiableFactory: {
      address: zeroAddress,
    },
  },
  [supportedL1Chains.sepolia]: {
    ensBaseRegistrarImplementation: {
      address: '0xb16870800de7444f6b2ebd885465412a5e581614',
    },
    ensBulkRenewal: {
      address: '0xf4404c962f7b859f6df712bff1f2e11745a238f0',
    },
    ensDnsRegistrar: {
      address: '0xafb9671d00b5152ebd219100f3801d3de1b4d288',
    },
    ensDnssecImpl: {
      address: '0x36f5a471cfa76b421fe9784778fd8cf35014eb11',
    },
    ensEthRegistrarController: {
      address: '0x99e517db3db5ec5424367b8b50cd11ddcb0008f1',
    },
    ensNameWrapper: {
      address: '0xca7e6d0ddc5f373197bbe6fc2f09c2314399f028',
    },
    ensPublicResolver: {
      address: '0x0e14ee0592da66bb4c8a8090066bc8a5af15f3e6',
    },
    ensRegistry: {
      address: '0x17795c119b8155ab9d3357c77747ba509695d7cb',
    },
    ensReverseRegistrar: {
      address: '0xf79f9970030fe60bd89d21591c7f2d80d7d21242',
    },
    ensUniversalResolver: {
      address: '0x50168842c0f5c9992a34085d9a6dc5b0a4f306ce',
    },
    ensDedicatedResolver: {
      address: '0x061377382a03e1f9d7f3c47eeb8dfb053922c910',
    },
    ensV2EthRegistry: {
      address: '0x3f0920aa92c5f9bce54643c09955c5f241f1f763',
    },
    ensVerifiableFactory: {
      address: '0xe52e7349922730c46a9d35e62303b03bb1058a7f',
    },
    ensUserRegistry: {
      address: '0xb1cdc9dc6130cf25465d4950c655dd35a3c81d7a',
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

export type ChainWithL1Ens<
  chain extends AnySupportedL1Chain = AnySupportedL1Chain,
> = Omit<chain, 'contracts' | 'subgraphs'> & {
  contracts: Omit<
    chain['contracts'],
    keyof (typeof ensL1Contracts)[chain['id']]
  > &
    (typeof ensL1Contracts)[chain['id']]
  subgraphs: (typeof ensL1Subgraphs)[chain['id']]
}

export const extendChainWithL1Ens = <const chain extends Chain>(
  chain: AssertSupportedChain<
    chain,
    AnySupportedL1Chain,
    typeof supportedL1Chains
  >,
): ChainWithL1Ens<Extract<chain, AnySupportedL1Chain>> => {
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
  } as ChainWithL1Ens<Extract<chain, AnySupportedL1Chain>>
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
export type RequireChainL1Contracts<
  chain extends Chain,
  contracts extends SuggestedContracts<SupportedL1Contract>,
> = chain extends Omit<Chain, 'contracts'> & {
  contracts: {
    [key in contracts]: ChainContract
  }
}
  ? chain
  : TypeError<`Chain "${chain['name']}" is missing required contracts: ${StringConcatenationOrder<contracts, ', '>}`>
// : TypeError<`Chain "${chain["name"]}" is missing required contracts: ${StringConcatenationOrder<Exclude<contracts, keyof ExtractContracts<chain>>, ", ">}`>;

export type RequireClientL1Contracts<
  chain extends Chain,
  contracts extends SuggestedContracts<SupportedL1Contract>,
  account extends Account | undefined = Account | undefined,
> = RequireClientContracts<SupportedL1Contract, chain, contracts, account>

export type ChainWithL1Contracts<
  contracts extends SuggestedContracts<SupportedL1Contract>,
  chain extends Chain = Chain,
> = ChainWithContracts<SupportedL1Contract, contracts, chain>
