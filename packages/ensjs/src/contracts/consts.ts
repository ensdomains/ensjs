import type { Account, Address, Chain, Client, Transport } from 'viem'
import { holesky, mainnet, sepolia } from 'viem/chains'
import type { Assign, Prettify } from '../types/index.js'

type ChainContract = {
  address: Address
  blockCreated?: number
}

export const supportedChains = [mainnet.id, holesky.id, sepolia.id] as const
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

export type SupportedChain = (typeof supportedChains)[number]
export type SupportedContract = (typeof supportedContracts)[number]

export const addresses = {
  [mainnet.id]: {
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
  },
  [holesky.id]: {
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
      address: '0xF404D2F84BC1735f7D9948F032D61F5fFfD9D3C3',
    },
    ensNameWrapper: {
      address: '0xab50971078225D365994dc1Edcb9b7FD72Bb4862',
    },
    ensPublicResolver: {
      address: '0x5a692ffe769A9B3D0e61F7446F5cAED650044C36',
    },
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensReverseRegistrar: {
      address: '0x65EE0b0B030a76c95a7ff046C0e0c8f7A2d1B004',
    },
    ensUniversalResolver: {
      address: '0xf606bc986635dab91b189aee8f565f45a0336f89',
    },
  },
  [sepolia.id]: {
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
      address: '0x4477cAc137F3353Ca35060E01E5aEb777a1Ca01B',
    },
    ensNameWrapper: {
      address: '0x0635513f179D50A207757E05759CbD106d7dFcE8',
    },
    ensPublicResolver: {
      address: '0x8948458626811dd0c23EB25Cc74291247077cC51',
    },
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensReverseRegistrar: {
      address: '0xCF75B92126B02C9811d8c632144288a3eb84afC8',
    },
    ensUniversalResolver: {
      address: '0x49c9331501b37191d54f5e332b307df82d15e9cc',
    },
  },
} as const satisfies Record<
  SupportedChain,
  Record<SupportedContract, { address: Address }>
>

type Subgraphs = {
  ens: {
    url: string
  }
}

export const subgraphs = {
  1: {
    ens: {
      url: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
    },
  },
  17000: {
    ens: {
      url: 'https://api.studio.thegraph.com/query/49574/ensholesky/version/latest',
    },
  },
  11155111: {
    ens: {
      url: 'https://api.studio.thegraph.com/query/49574/enssepolia/version/latest',
    },
  },
} as const satisfies Record<SupportedChain, Subgraphs>

type EnsChainContracts = {
  ensBaseRegistrarImplementation: ChainContract
  ensDnsRegistrar: ChainContract
  ensEthRegistrarController: ChainContract
  ensNameWrapper: ChainContract
  ensPublicResolver: ChainContract
  ensReverseRegistrar: ChainContract
  ensBulkRenewal: ChainContract
  ensDnssecImpl: ChainContract
}

type BaseChainContracts = {
  multicall3: ChainContract
  ensUniversalResolver: ChainContract
  ensRegistry: ChainContract
}

type NameChainL1Contracts = {
  ethFallbackResolver: ChainContract
  l1EjectionController: ChainContract
}

export type ChainWithEns<chain extends Chain = Chain> = Omit<
  chain,
  'contracts'
> & {
  contracts: BaseChainContracts & EnsChainContracts & NameChainL1Contracts
  subgraphs: Subgraphs
}

export type ChainWithContract<
  contract extends
    | SupportedContract
    | keyof BaseChainContracts
    | keyof NameChainL1Contracts,
> = Chain & {
  contracts: {
    [key in contract]: ChainContract
  }
}

export type ChainWithBaseContracts = Assign<
  Omit<Chain, 'contracts'>,
  {
    contracts: BaseChainContracts
  }
>

export type CheckedChainWithEns<chain extends Chain> =
  chain['id'] extends SupportedChain
    ? chain['contracts'] extends BaseChainContracts
      ? chain & {
          contracts: Prettify<(typeof addresses)[chain['id']]>
          subgraphs: (typeof subgraphs)[chain['id']]
        }
      : never
    : never

export type ClientWithEns<
  TTransport extends Transport = Transport,
  TChain extends ChainWithEns = ChainWithEns,
> = Client<TTransport, TChain>

export type ClientWithAccount<
  TTransport extends Transport = Transport,
  TChain extends ChainWithEns = ChainWithEns,
  TAccount extends Account | undefined = Account | undefined,
> = Client<TTransport, TChain, TAccount>
