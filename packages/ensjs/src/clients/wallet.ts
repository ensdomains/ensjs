import {
  createWalletClient,
  type Account,
  type Address,
  type Client,
  type ClientConfig,
  type ParseAccount,
  type Transport,
  type WalletActions,
  type WalletRpcSchema,
} from 'viem'
import { addEnsContracts } from '../contracts/addEnsContracts.js'
import type {
  ChainWithBaseContracts,
  ChainWithEns,
  CheckedChainWithEns,
} from '../contracts/consts.js'
import type { Assign, Prettify } from '../types.js'
import { ensWalletActions, type EnsWalletActions } from './decorators/wallet.js'

export type EnsWalletClientConfig<
  transport extends Transport,
  chain extends ChainWithBaseContracts,
  accountOrAddress extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = Assign<
  Pick<
    ClientConfig<transport, chain, accountOrAddress>,
    'account' | 'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
  >,
  {
    chain: chain
  }
>

export type EnsWalletClient<
  transport extends Transport = Transport,
  chain extends ChainWithEns = ChainWithEns,
  account extends Account | undefined = Account | undefined,
> = Prettify<
  Client<
    transport,
    chain,
    account,
    WalletRpcSchema,
    WalletActions<chain, account> & EnsWalletActions<chain, account>
  >
>

/**
 * Creates an ENS Wallet Client with a given [Transport](https://viem.sh/docs/clients/intro.html) configured for a [Chain](https://viem.sh/docs/clients/chains.html).
 *
 * @param config - {@link EnsWalletClientConfig}
 * @returns An ENS Wallet Client. {@link EnsWalletClient}
 *
 * @example
 * import { custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createEnsWalletClient } from '@ensdomains/ensjs'
 *
 * const client = createEnsWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 */
export const createEnsWalletClient = <
  transport extends Transport,
  chain extends ChainWithBaseContracts,
  accountOrAddress extends Account | Address | undefined = undefined,
>({
  account,
  chain,
  key = 'ensWallet',
  name = 'ENS Wallet Client',
  transport,
  pollingInterval,
}: EnsWalletClientConfig<transport, chain, accountOrAddress>): EnsWalletClient<
  transport,
  CheckedChainWithEns<chain>,
  ParseAccount<accountOrAddress>
> => {
  return createWalletClient({
    account,
    chain: addEnsContracts(chain),
    key,
    name,
    pollingInterval,
    transport,
  }).extend(ensWalletActions)
}
