import {
  type SetContentHashRecordErrorType as ensjs_SetContentHashRecordErrorType,
  type SetContentHashRecordParameters as ensjs_SetContentHashRecordParameters,
  type SetContentHashRecordReturnType as ensjs_SetContentHashRecordReturnType,
  setContentHashRecord as ensjs_setContentHashRecord,
} from '@ensdomains/ensjs/wallet'
import { type Config, getConnectorClient, type SelectChains } from '@wagmi/core'
import type {
  ChainIdParameter,
  Compute,
  ConnectorParameter,
} from '@wagmi/core/internal'
import type { Account, Chain, Client } from 'viem'
import { getAction } from '../../utils/getAction.js'

export type SetContentHashRecordParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<
      ensjs_SetContentHashRecordParameters<chains[key], Account, any>,
      'chain'
    > &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number]

export type SetContentHashRecordReturnType =
  ensjs_SetContentHashRecordReturnType

export type SetContentHashRecordErrorType = ensjs_SetContentHashRecordErrorType

export async function setContentHashRecord<config extends Config>(
  config: config,
  parameters: SetContentHashRecordParameters<config>,
): Promise<SetContentHashRecordReturnType> {
  const { account, chainId, connector, ...rest } = parameters

  let client: Client<any, Chain>
  if (typeof account === 'object' && account?.type === 'local')
    client = config.getClient({ chainId })
  else
    client = await getConnectorClient(config, {
      account: account ?? undefined,
      chainId,
      connector,
    })

  const action = getAction(
    client,
    ensjs_setContentHashRecord,
    'setContentHashRecord',
  )
  return await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  })
}
