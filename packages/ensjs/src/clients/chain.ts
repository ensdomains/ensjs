import {
  type Account,
  type Chain,
  type ChainContract,
  type Client,
  type Transport,
  getChainContractAddress as viem_getChainContractAddress,
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
  holesky: 17000,
  sepolia: 11155111,
  devnetL1: 15658733,
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
  'ensL2EthRegistrar',
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
    ensL2EthRegistrar: {
      address: '0x0000000000000000000000000000000000000000',
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
    ensL2EthRegistrar: {
      address: '0xf9b79ab5f6539846ad639eef6b60e145bf6e5cbe',
    },
    ensNameWrapper: {
      address: '0xca7e6d0ddc5f373197bbe6fc2f09c2314399f028',
    },
    ensPublicResolver: {
      address: '0x0e14ee0592da66bb4c8a8090066bc8a5af15f3e6',
    },
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensReverseRegistrar: {
      address: '0xf79f9970030fe60bd89d21591c7f2d80d7d21242',
    },
    ensUniversalResolver: {
      address: '0x198827b2316e020c48b500fc3cebdbcaf58787ce',
    },
  },
  [supportedChains.devnetL1]: {
    ensBaseRegistrarImplementation: {
      address: '0x851356ae760d987E095750cCeb3bC6014560891C',
    },
    ensBulkRenewal: {
      address: '0x0355B7B8cb128fA5692729Ab3AAa199C1753f726',
    },
    ensDnsRegistrar: {
      address: '0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc',
    },
    ensDnssecImpl: {
      address: '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
    },
    ensEthRegistrarController: {
      address: '0x36b58F5C1969B7b6591D752ea6F5486D069010AB',
    },
    ensL2EthRegistrar: {
      address: '0xf4B146FbA71F41E0592668ffbF264F1D186b2Ca8',
    },
    ensNameWrapper: {
      address: '0x2E2Ed0Cfd3AD2f1d34481277b3204d807Ca2F8c2',
    },
    ensPublicResolver: {
      address: '0xBEc49fA140aCaA83533fB00A2BB19bDdd0290f25',
    },
    ensRegistry: {
      address: '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82',
    },
    ensReverseRegistrar: {
      address: '0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d',
    },
    ensUniversalResolver: {
      address: '0xc351628EB244ec633d5f21fBD6621e1a683B1181',
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
  [supportedChains.devnetL1]: {
    ens: {
      url: 'http://localhost:42069/subgraph',
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
