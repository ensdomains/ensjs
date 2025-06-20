import {
  type SetAddressRecordErrorType as ensjs_SetAddressRecordErrorType,
  type SetAddressRecordParameters as ensjs_SetAddressRecordParameters,
  type SetAddressRecordReturnType as ensjs_SetAddressRecordReturnType,
  setAddressRecord as ensjs_setAddressRecord,
} from '@ensdomains/ensjs/wallet'
import { type Config, getConnectorClient, type SelectChains } from '@wagmi/core'
import type {
  ChainIdParameter,
  Compute,
  ConnectorParameter,
} from '@wagmi/core/internal'
import type { Account, Chain, Client } from 'viem'
import { getAction } from '../../utils/getAction.js'

export type SetAddressRecordParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<
      ensjs_SetAddressRecordParameters<chains[key], Account, chains[key]>,
      'chain'
    > &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number]

export type SetAddressRecordReturnType = ensjs_SetAddressRecordReturnType

export type SetAddressRecordErrorType = ensjs_SetAddressRecordErrorType

export async function setAddressRecord<config extends Config>(
  config: config,
  parameters: SetAddressRecordParameters<config>,
): Promise<SetAddressRecordReturnType> {
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

  const action = getAction(client, ensjs_setAddressRecord, 'setAddressRecord')
  return await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  })
}
