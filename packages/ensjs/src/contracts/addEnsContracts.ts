import type { Chain } from 'viem'
import { NoChainError, UnsupportedChainError } from '../errors/contracts.js'
import {
  type CheckedChainWithEns,
  type SupportedChain,
  addresses,
  subgraphs,
  supportedChains,
} from './consts.js'

type AddEnsContractsOptions = {
  subgraphApiKey?: string
}

/**
 * Adds ENS contract addresses to the viem chain
 * @param chain - The viem {@link Chain} object to add the ENS contracts to
 * @param options.subgraphApiKey - The API key to use for the ENS subgraph
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
export const addEnsContracts = <const TChain extends Chain>(
  chain: TChain,
  options?: AddEnsContractsOptions,
) => {
  if (!chain) throw new NoChainError()
  if (!supportedChains.includes(chain.id as SupportedChain))
    throw new UnsupportedChainError({
      chainId: chain.id,
      supportedChains,
    })
  return {
    ...chain,
    contracts: {
      ...chain.contracts,
      ...addresses[chain.id as SupportedChain],
    },
    subgraphs: {
      ...subgraphs[chain.id as SupportedChain],
      ...(options?.subgraphApiKey
        ? {
            ens: {
              url:
                options.subgraphApiKey && chain.id === 1
                  ? `https://gateway-arbitrum.network.thegraph.com/api/${options.subgraphApiKey}/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH`
                  : subgraphs[chain.id as SupportedChain].ens.url,
            },
          }
        : {}),
    },
  } as unknown as CheckedChainWithEns<TChain>
}
