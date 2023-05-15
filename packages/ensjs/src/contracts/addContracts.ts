import type {
  Account,
  Chain,
  PublicClient,
  Transport,
  WalletClient,
} from 'viem'
import type { ChainContract } from 'viem/src/types/chain'

const supportedChains = ['homestead', 'goerli']

const addresses = {
  homestead: {
    ensBaseRegistrarImplementation: {
      address: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
    },
    ensDnsRegistrar: {
      address: '0x58774Bb8acD458A640aF0B88238369A167546ef2',
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
    ensReverseRegistrar: {
      address: '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb',
    },
    ensBulkRenewal: {
      address: '0xa12159e5131b1eEf6B4857EEE3e1954744b5033A',
    },
  },
  goerli: {
    ensBaseRegistrarImplementation: {
      address: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
    },
    ensDnsRegistrar: {
      address: '0x8edc487D26F6c8Fa76e032066A3D4F87E273515d',
    },
    ensEthRegistrarController: {
      address: '0xCc5e7dB10E65EED1BBD105359e7268aa660f6734',
    },
    ensNameWrapper: {
      address: '0x114D4603199df73e7D157787f8778E21fCd13066',
    },
    ensPublicResolver: {
      address: '0xd7a4F6473f32aC2Af804B3686AE8F19E48B8fF5f',
    },
    ensReverseRegistrar: {
      address: '0x6d9F26FfBcF1c6f0bAe9F2C1f7fBe8eE6B1d8d4d',
    },
    ensBulkRenewal: {
      address: '0x6d9F26FfBcF1c6f0bAe9F2C1f7fBe8eE6B1d8d4d',
    },
  },
} as const

const subgraphs = {
  homestead: {
    ens: {
      url: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
    },
  },
  goerli: {
    ens: {
      url: 'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli',
    },
  },
} as const

type Subgraphs = {
  ens: {
    url: string
  }
}

type EnsChainContracts = {
  ensBaseRegistrarImplementation: ChainContract
  ensDnsRegistrar: ChainContract
  ensEthRegistrarController: ChainContract
  ensNameWrapper: ChainContract
  ensPublicResolver: ChainContract
  ensReverseRegistrar: ChainContract
  ensBulkRenewal: ChainContract
}

type BaseChainContracts = {
  multicall3: ChainContract
  ensUniversalResolver: ChainContract
  ensRegistry: ChainContract
}

export type ChainWithEns<TChain extends Chain = Chain> = TChain & {
  contracts: BaseChainContracts & EnsChainContracts
  subgraphs: Subgraphs
}

export type ClientWithEns<
  TTransport extends Transport = Transport,
  TChain extends ChainWithEns = ChainWithEns,
> = PublicClient<TTransport, TChain>

export type WalletWithEns<
  TTransport extends Transport = Transport,
  TChain extends ChainWithEns = ChainWithEns,
  TAccount extends Account | undefined = Account | undefined,
> = WalletClient<TTransport, TChain, TAccount>

export const addContracts = <TChain extends Chain = Chain>(
  chains: TChain[],
): ChainWithEns<TChain>[] =>
  chains
    .filter((chain) => supportedChains.includes(chain.network))
    .map(
      (chain) =>
        ({
          ...chain,
          contracts: {
            ...chain.contracts,
            ...addresses[chain.name as keyof typeof addresses],
          },
          subgraphs: {
            ...subgraphs[chain.name as keyof typeof subgraphs],
          },
        } as ChainWithEns<TChain>),
    )
