// Source: https://github.com/wevm/wagmi/blob/main/packages/core/src/utils/getAction.ts

import type { EnsPublicActions, EnsWalletActions } from '@ensdomains/ensjs'
import type {
  ChainWithContracts,
  SupportedContract,
} from '@ensdomains/ensjs/chain'
import type {
  Account,
  Chain,
  Client,
  // PublicActions,
  RpcSchema,
  Transport,
  // WalletActions,
} from 'viem'

/**
 * Retrieves and returns an action from the client (if exists), and falls
 * back to the tree-shakable action.
 *
 * Useful for extracting overridden actions from a client (ie. if a consumer
 * wants to override the `sendTransaction` implementation).
 */
export function getAction<
  transport extends Transport,
  chain extends Chain,
  account extends Account | undefined,
  rpcSchema extends RpcSchema | undefined,
  extended extends { [key: string]: unknown },
  client extends Client<transport, chain, account, rpcSchema, extended>,
  parameters,
  returnType,
>(
  client: client,
  actionFn: (_: any, parameters: parameters) => returnType,
  // Some minifiers drop `Function.prototype.name`, or replace it with short letters,
  // meaning that `actionFn.name` will not always work. For that case, the consumer
  // needs to pass the name explicitly.
  name:
    | keyof EnsPublicActions
    | keyof EnsWalletActions<
        ChainWithContracts<SupportedContract>,
        NonNullable<account>
      >,
): (parameters: parameters) => returnType {
  const action_implicit = client[actionFn.name]
  if (typeof action_implicit === 'function')
    return action_implicit as (params: parameters) => returnType

  const action_explicit = client[name]
  if (typeof action_explicit === 'function')
    return action_explicit as (params: parameters) => returnType

  return (params) => actionFn(client, params)
}
