import type { Chain, PublicClient, Transport } from 'viem'
import type { ChainContract } from 'viem/src/types/chain'
import { Prettify } from '../types'

const supportedChains = ['homestead', 'goerli']

const addresses = {
  homestead: {
    baseRegistrarImplementation: {
      address: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
    },
    dnsRegistrar: {
      address: '0x58774Bb8acD458A640aF0B88238369A167546ef2',
    },
    ethRegistrarController: {
      address: '0x253553366Da8546fC250F225fe3d25d0C782303b',
    },
    nameWrapper: {
      address: '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401',
    },
    publicResolver: {
      address: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
    },
    reverseRegistrar: {
      address: '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb',
    },
    bulkRenewal: {
      address: '0xa12159e5131b1eEf6B4857EEE3e1954744b5033A',
    },
  },
  goerli: {
    baseRegistrarImplementation: {
      address: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
    },
    dnsRegistrar: {
      address: '0x8edc487D26F6c8Fa76e032066A3D4F87E273515d',
    },
    ethRegistrarController: {
      address: '0xCc5e7dB10E65EED1BBD105359e7268aa660f6734',
    },
    nameWrapper: {
      address: '0x114D4603199df73e7D157787f8778E21fCd13066',
    },
    publicResolver: {
      address: '0xd7a4F6473f32aC2Af804B3686AE8F19E48B8fF5f',
    },
    reverseRegistrar: {
      address: '0x6d9F26FfBcF1c6f0bAe9F2C1f7fBe8eE6B1d8d4d',
    },
    bulkRenewal: {
      address: '0x6d9F26FfBcF1c6f0bAe9F2C1f7fBe8eE6B1d8d4d',
    },
  },
} as const

export type ChainWithEns<TChain extends Chain = Chain> = Prettify<
  TChain & {
    contracts: {
      ensjs: {
        baseRegistrarImplementation: ChainContract
        dnsRegistrar: ChainContract
        ethRegistrarController: ChainContract
        nameWrapper: ChainContract
        publicResolver: ChainContract
        reverseRegistrar: ChainContract
        bulkRenewal: ChainContract
      }
    }
  }
>

export type ClientWithEns<
  TTransport extends Transport = Transport,
  TChain extends ChainWithEns = ChainWithEns,
> = PublicClient<TTransport, TChain>

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
            ensjs: {
              ...addresses[chain.name as keyof typeof addresses],
            },
          },
        } as ChainWithEns<TChain>),
    )
