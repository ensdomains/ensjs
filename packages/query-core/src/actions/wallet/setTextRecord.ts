import {
  type SetTextRecordErrorType as ensjs_SetTextRecordErrorType,
  type SetTextRecordParameters as ensjs_SetTextRecordParameters,
  type SetTextRecordReturnType as ensjs_SetTextRecordReturnType,
  setTextRecord as ensjs_setTextRecord,
} from '@ensdomains/ensjs/wallet'
import { type Config, getConnectorClient, type SelectChains } from '@wagmi/core'
import type {
  ChainIdParameter,
  Compute,
  ConnectorParameter,
} from '@wagmi/core/internal'
import type { Account, Chain, Client } from 'viem'
import { getAction } from '../../utils/getAction.js'

export type SetTextRecordParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<
      ensjs_SetTextRecordParameters<chains[key], Account, chains[key]>,
      'chain'
    > &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number]

export type SetTextRecordReturnType = ensjs_SetTextRecordReturnType

export type SetTextRecordErrorType = ensjs_SetTextRecordErrorType

export async function setTextRecord<config extends Config>(
  config: config,
  parameters: SetTextRecordParameters<config>,
): Promise<SetTextRecordReturnType> {
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

  const action = getAction(client, ensjs_setTextRecord, 'setTextRecord')
  return await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  })
}
