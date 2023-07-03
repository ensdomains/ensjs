import {
  Account,
  Address,
  ParseAccount,
  WalletActions,
  WalletRpcSchema,
  createWalletClient,
  type Chain,
  type Client,
  type ClientConfig,
  type Transport,
} from 'viem'
import { addEnsContracts } from '../contracts/addEnsContracts'
import { type ChainWithEns } from '../contracts/consts'
import { type Prettify } from '../types'
import { ensWalletActions, type EnsWalletActions } from './decorators/wallet'

export type EnsWalletClientConfig<
  TTransport extends Transport,
  TChain extends Chain,
  TAccountOrAddress extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = Pick<
  ClientConfig<TTransport, TChain, TAccountOrAddress>,
  'account' | 'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
> & {
  chain: Exclude<ClientConfig<TTransport, TChain>['chain'], undefined>
}

export type EnsWalletClient<
  TTransport extends Transport = Transport,
  TChain extends ChainWithEns = ChainWithEns,
  TAccount extends Account | undefined = Account | undefined,
> = Prettify<
  Client<
    TTransport,
    TChain,
    TAccount,
    WalletRpcSchema,
    WalletActions<TChain, TAccount> & EnsWalletActions<TChain, TAccount>
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
  TTransport extends Transport,
  TChain extends Chain,
  TAccountOrAddress extends Account | Address | undefined = undefined,
>({
  account,
  chain,
  key = 'ensWallet',
  name = 'ENS Wallet Client',
  transport,
  pollingInterval,
}: EnsWalletClientConfig<
  TTransport,
  TChain,
  TAccountOrAddress
>): EnsWalletClient<
  TTransport,
  ChainWithEns<TChain>,
  ParseAccount<TAccountOrAddress>
> => {
  return createWalletClient({
    account,
    chain: addEnsContracts<TChain>(chain),
    key,
    name,
    pollingInterval,
    transport,
  }).extend(ensWalletActions)
}
