import {
  createClient,
  type Client,
  type ClientConfig,
  type PublicRpcSchema,
  type Transport,
} from 'viem'
import { addEnsContracts } from '../contracts/addEnsContracts.js'
import type {
  ChainWithBaseContracts,
  ChainWithEns,
} from '../contracts/consts.js'
import type { Prettify } from '../types.js'
import {
  ensSubgraphActions,
  type EnsSubgraphActions,
} from './decorators/subgraph.js'

export type EnsSubgraphClientConfig<
  transport extends Transport = Transport,
  chain extends ChainWithBaseContracts = ChainWithBaseContracts,
> = Pick<
  ClientConfig<transport, chain>,
  'batch' | 'key' | 'name' | 'pollingInterval' | 'transport'
> & {
  chain: chain
}

export type EnsSubgraphClient<
  transport extends Transport = Transport,
  chain extends ChainWithEns = ChainWithEns,
> = Prettify<
  Client<transport, chain, undefined, PublicRpcSchema, EnsSubgraphActions>
>

/**
 * Creates a ENS Subgraph Client with a given [Transport](https://viem.sh/docs/clients/intro.html) configured for a [Chain](https://viem.sh/docs/clients/chains.html).
 *
 * @param config - {@link EnsSubgraphClientConfig}
 * @returns An ENS Subgraph Client. {@link EnsSubgraphClient}
 *
 * @example
 * import { http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createEnsSubgraphClient } from '@ensdomains/ensjs'
 *
 * const client = createEnsSubgraphClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 */
export const createEnsSubgraphClient = <
  transport extends Transport,
  chain extends ChainWithBaseContracts,
>({
  batch,
  chain,
  key = 'ensSubgraph',
  name = 'ENS Subgraph Client',
  transport,
  pollingInterval,
}: EnsSubgraphClientConfig<transport, chain>): EnsSubgraphClient<
  transport,
  ChainWithEns<chain>
> => {
  return createClient({
    batch,
    chain: addEnsContracts(chain),
    key,
    name,
    pollingInterval,
    transport,
    type: 'ensSubgraphClient',
  }).extend(ensSubgraphActions)
}
