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
              url: getSubgraphUrl(
                chain.id as SupportedChain,
                options.subgraphApiKey,
              ),
            },
          }
        : {}),
    },
  } as unknown as CheckedChainWithEns<TChain>
}

const getSubgraphUrl = (chainId: SupportedChain, subgraphApiKey?: string) => {
  if (!subgraphApiKey) {
    return subgraphs[chainId].ens.url
  }

  switch (chainId) {
    case 1:
      return `https://gateway-arbitrum.network.thegraph.com/api/${subgraphApiKey}/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH`
    case 11155111:
      return `https://gateway-arbitrum.network.thegraph.com/api/${subgraphApiKey}/subgraphs/id/G1SxZs317YUb9nQX3CC98hDyvxfMJNZH5pPRGpNrtvwN`
  }
}
