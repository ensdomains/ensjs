import type { Chain } from 'viem'
import {
  type AnySupportedChain,
  type ChainWithEns,
  ensContracts,
  type SupportedChainId,
  supportedChains,
} from '../clients/chain.js'
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
export const addEnsContracts = <const chain extends AnySupportedChain>(
  chain: chain,
) => {
  if (!chain) throw new NoChainError()
  if (!Object.values(supportedChains).includes(chain.id as SupportedChainId))
    throw new UnsupportedChainError({
      chainId: chain.id,
      supportedChains: Object.values(supportedChains),
    })
  return {
    ...chain,
    contracts: {
      ...chain.contracts,
      ...ensContracts[chain.id as SupportedChainId],
    },
    subgraphs: {
      ...ensContracts[chain.id as SupportedChainId],
    },
  } as unknown as ChainWithEns<chain>
}
