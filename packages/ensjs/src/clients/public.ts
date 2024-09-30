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
import { ensPublicActions, type EnsPublicActions } from './decorators/public.js'
import {
  ensSubgraphActions,
  type EnsSubgraphActions,
} from './decorators/subgraph.js'

export type EnsPublicClientConfig<
  transport extends Transport = Transport,
  chain extends ChainWithBaseContracts = ChainWithBaseContracts,
> = Pick<
  ClientConfig<transport, chain>,
  'batch' | 'key' | 'name' | 'pollingInterval' | 'transport'
> & {
  chain: chain
}

export type EnsPublicClient<
  transport extends Transport = Transport,
  chain extends ChainWithEns = ChainWithEns,
> = Prettify<
  Client<
    transport,
    chain,
    undefined,
    PublicRpcSchema,
    EnsPublicActions & EnsSubgraphActions
  >
>

/**
 * Creates a ENS Public Client with a given [Transport](https://viem.sh/docs/clients/intro.html) configured for a [Chain](https://viem.sh/docs/clients/chains.html).
 *
 * @param config - {@link EnsPublicClientConfig}
 * @returns An ENS Public Client. {@link EnsPublicClient}
 *
 * @example
 * import { http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createEnsPublicClient } from '@ensdomains/ensjs'
 *
 * const client = createEnsPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 */
export const createEnsPublicClient = <
  transport extends Transport,
  chain extends ChainWithBaseContracts,
>({
  batch,
  chain,
  key = 'ensPublic',
  name = 'ENS Public Client',
  transport,
  pollingInterval,
}: EnsPublicClientConfig<transport, chain>): EnsPublicClient<
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
    type: 'ensPublicClient',
  })
    .extend(ensPublicActions)
    .extend(ensSubgraphActions)
}
