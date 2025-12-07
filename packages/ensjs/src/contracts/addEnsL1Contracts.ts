import type { Chain } from 'viem'
import {
  type AnySupportedL1Chain,
  type ChainWithL1Ens,
  ensL1Contracts,
  type SupportedL1ChainId,
  supportedL1Chains,
} from '../clients/l1.js'
import { NoChainError, UnsupportedChainError } from '../errors/contracts.js'

/**
 * Adds ENS contract addresses to the viem chain
 * @param chain - The viem {@link Chain} object to add the ENS contracts to
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 *
 * const clientWithEns = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 */
export const addEnsL1Contracts = <const chain extends AnySupportedL1Chain>(
  chain: chain,
) => {
  if (!chain) throw new NoChainError()
  if (
    !Object.values(supportedL1Chains).includes(chain.id as SupportedL1ChainId)
  )
    throw new UnsupportedChainError({
      chainId: chain.id,
      supportedChains: Object.values(supportedL1Chains),
    })
  return {
    ...chain,
    contracts: {
      ...chain.contracts,
      ...ensL1Contracts[chain.id as SupportedL1ChainId],
    },
    subgraphs: {
      ...ensL1Contracts[chain.id as SupportedL1ChainId],
    },
  } as unknown as ChainWithL1Ens<chain>
}
