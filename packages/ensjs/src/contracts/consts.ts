import type { Account, Address, Chain, Client, Transport } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import type { Assign, Prettify } from '../types.js'

type ChainContract = {
  address: Address
  blockCreated?: number
}

export const supportedChains = [mainnet.id, sepolia.id] as const
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
  'ensDefaultReverseRegistrar',
  'ensUniversalResolver',
  'wrappedEthRegistrarController',
  'wrappedPublicResolver',
  'legacyEthRegistrarController',
  'legacyPublicResolver',
  'ensDefaultReverseRegistrar',
] as const

export type SupportedChain = (typeof supportedChains)[number]
export type SupportedContract = (typeof supportedContracts)[number]

export const addresses = {
  [mainnet.id]: {
    ensBaseRegistrarImplementation: {
      address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
    },
    ensBulkRenewal: {
      address: '0xc649947a460B135e6B9a70Ee2FB429aDBB529290',
    },
    ensDnsRegistrar: {
      address: '0xB32cB5677a7C971689228EC835800432B339bA2B',
    },
    ensDnssecImpl: {
      address: '0x0fc3152971714E5ed7723FAFa650F86A4BaF30C5',
    },
    ensEthRegistrarController: {
      address: '0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547',
    },
    ensNameWrapper: {
      address: '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401',
    },
    ensPublicResolver: {
      address: '0xF29100983E058B709F3D539b0c765937B804AC15',
    },
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensReverseRegistrar: {
      address: '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb',
    },
    ensDefaultReverseRegistrar: {
      address: '0x283F227c4Bd38ecE252C4Ae7ECE650B0e913f1f9',
    },
    ensUniversalResolver: {
      address: '0xED73a03F19e8D849E44a39252d222c6ad5217E1e',
    },
    wrappedEthRegistrarController: {
      address: '0x253553366Da8546fC250F225fe3d25d0C782303b'
    },
    wrappedPublicResolver: {
      address: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63'
    },
    legacyEthRegistrarController: {
      address: '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5',
    },
    legacyPublicResolver: {
      address: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
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
      address: '0xfb3cE5D01e0f33f41DbB39035dB9745962F1f968',
    },
    ensNameWrapper: {
      address: '0x0635513f179D50A207757E05759CbD106d7dFcE8',
    },
    ensPublicResolver: {
      address: '0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5',
    },
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensDefaultReverseRegistrar: {
      address: '0x4F382928805ba0e23B30cFB75fC9E848e82DFD47'
    },
    ensReverseRegistrar: {
      address: '0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6',
    },
    ensUniversalResolver: {
      address: '0x3c85752a5d47DD09D677C645Ff2A938B38fbFEbA',
    },
    wrappedEthRegistrarController: {
      address: '0x4477cAc137F3353Ca35060E01E5aEb777a1Ca01B'
    },
    wrappedPublicResolver: {
      address: '0x8948458626811dd0c23EB25Cc74291247077cC51'
    },
    legacyEthRegistrarController: {
      address: '0x7e02892cfc2Bfd53a75275451d73cF620e793fc0',
    },
    legacyPublicResolver: {
      address: '0x0CeEC524b2807841739D3B5E161F5bf1430FFA48',
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
  legacyEthRegistrarController: ChainContract
  legacyPublicResolver: ChainContract
}

type BaseChainContracts = {
  multicall3: ChainContract
  ensUniversalResolver: ChainContract
  ensRegistry: ChainContract
}

export type ChainWithEns<TChain extends Chain = Chain> = Omit<
  TChain,
  'contracts'
> & {
  contracts: BaseChainContracts & EnsChainContracts
  subgraphs: Subgraphs
}

export type ChainWithBaseContracts = Assign<
  Omit<Chain, 'contracts'>,
  {
    contracts: BaseChainContracts
  }
>

export type CheckedChainWithEns<TChain extends Chain> =
  TChain['id'] extends SupportedChain
    ? TChain['contracts'] extends BaseChainContracts
      ? TChain & {
          contracts: Prettify<(typeof addresses)[TChain['id']]>
          subgraphs: (typeof subgraphs)[TChain['id']]
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
