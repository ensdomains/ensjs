import type { Account, Chain, ChainContract } from 'viem'
import {
  type ChainWithContracts,
  type RequireClientContracts,
  type SuggestedContracts,
  supportedNamechainContracts,
} from './shared.js'

export const supportedL2Chains = {
  namechainSepolia: 11155111,
} as const

const supportedL2ChainIds = Object.values(supportedL2Chains)

export type AnySupportedL2Chain = Omit<Chain, 'id'> & {
  id: SupportedL2ChainId
}

export type SupportedL2ChainId =
  (typeof supportedL2Chains)[keyof typeof supportedL2Chains]

// ================================
// Supported contracts
// ================================

export const supportedL2Contracts = [
  ...supportedNamechainContracts,
  'ethRegistrar',
  'usdc',
] as const

export type SupportedL2Contract = (typeof supportedL2Contracts)[number]

export const ensL2Contracts = {
  [supportedL2Chains.namechainSepolia]: {
    ensDedicatedResolver: {
      address: '0xa20b41dc7336c4d974e3c9a6ea01b77647559c46',
    },
    ensUserRegistry: {
      address: '0x8cfbf4a6b3f546021b9f8e6099bda2cb0297cd25',
    },
    ensV2EthRegistry: {
      address: '0xf332544e6234f1ca149907d0d4658afd5feb6831',
    },
    ensVerifiableFactory: {
      address: '0xb9541bdd86c4d01c726a33694f14e8528adcb20d',
    },
    usdc: {
      address: '0x7Fc21ceb0C5003576ab5E101eB240c2b822c95d2',
    },
    ethRegistrar: {
      address: '0x3334f0ebcbc4b5b7067f3aff25c6da8973690d54',
    },
  },
} as const satisfies Record<
  SupportedL2ChainId,
  Record<SupportedL2Contract, ChainContract>
>

export type ChainWithL2Ens<
  chain extends AnySupportedL2Chain = AnySupportedL2Chain,
> = Omit<chain, 'contracts' | 'subgraphs'> & {
  contracts: Omit<
    chain['contracts'],
    keyof (typeof ensL2Contracts)[chain['id']]
  > &
    (typeof ensL2Contracts)[chain['id']]
}

export const extendChainWithL2Ens = <const chain extends AnySupportedL2Chain>(
  chain: chain,
): ChainWithL2Ens<Extract<chain, AnySupportedL2Chain>> => {
  const initial = chain as AnySupportedL2Chain

  if (!supportedL2ChainIds.includes(initial.id)) {
    throw new Error(`Chain ${initial.name} is not supported`)
  }

  return {
    ...initial,
    contracts: {
      ...initial.contracts,
      ...ensL2Contracts[initial.id],
    },
  } as ChainWithL2Ens<Extract<chain, AnySupportedL2Chain>>
}

export type RequireClientL2Contracts<
  chain extends Chain,
  contracts extends SuggestedContracts<SupportedL2Contract>,
  account extends Account | undefined = Account | undefined,
> = RequireClientContracts<SupportedL2Contract, chain, contracts, account>

export type ChainWithL2Contracts<
  contracts extends SuggestedContracts<SupportedL2Contract>,
  chain extends Chain = Chain,
> = ChainWithContracts<SupportedL2Contract, contracts, chain>
