import {
  type Account,
  type Chain,
  type ChainContract,
  type Client,
  type Transport,
  getChainContractAddress as viem_getChainContractAddress,
  zeroAddress,
} from 'viem'
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
  sepolia: 11155111,
  // devnetL1: 15658733,
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
  'ensL2VerifiableFactory',
  'ensL2EthRegistrar',
  'ensL2Registry',
  'usdc',
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
    ensL2EthRegistrar: {
      address: '0x0000000000000000000000000000000000000000',
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
    ensL2VerifiableFactory: {
      address: zeroAddress,
    },
    ensL2Registry: {
      address: zeroAddress,
    },
    usdc: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
  },
  [supportedChains.sepolia]: {
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
      address: '0x98369eb1318447f787869560b228fa108d1666b3',
    },
    ensL2VerifiableFactory: {
      address: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
    },
    ensL2EthRegistrar: {
      address: '0x774faadcd7e8c4b7441aa2927f10845fea083ea1',
    },
    ensL2Registry: {
      address: '0x0f3eb298470639a96bd548cea4a648bc80b2cee2',
    },
    usdc: {
      address: '0x9028ab8e872af36c30c959a105cb86d1038412ae',
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

export type ChainWithSubgraph = { subgraphs: EnsSubgraph }

export const ensSubgraphs = {
  [supportedChains.mainnet]: {
    ens: {
      url: 'https://api.alpha.blue.ensnode.io/subgraph',
    },
  },
  [supportedChains.sepolia]: {
    ens: {
      url: 'https://ensnode-api-sepolia.up.railway.app/subgraph',
    },
  },
  // [supportedChains.devnetL1]: {
  //   ens: {
  //     url: 'http://localhost:42069/subgraph',
  //   },
  // },
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
  Omit<chain, 'contracts' | 'subgraphs'> & {
    contracts: Omit<
      chain['contracts'],
      keyof (typeof ensContracts)[chain['id']]
    > &
      (typeof ensContracts)[chain['id']]
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
> = Omit<chain, 'contracts'> & {
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
> = chain extends Omit<Chain, 'contracts'> & {
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
> = chain extends Omit<Chain, 'contracts'> & {
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
