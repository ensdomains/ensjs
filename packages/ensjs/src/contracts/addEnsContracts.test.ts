import { mainnet, sepolia } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { ensL1Contracts, ensL1Subgraphs } from '../clients/chain.js'
import { addEnsContracts } from './addEnsContracts.js'

describe('addEnsContracts', () => {
  it.each([mainnet, sepolia])(
    'adds contracts and subgraphs for $name',
    (chain) => {
      const chainWithEns = addEnsContracts(chain)
      expect(chainWithEns.contracts).toMatchObject(ensL1Contracts[chain.id])
      expect(chainWithEns.subgraphs).toEqual(ensL1Subgraphs[chain.id])
    },
  )
})
