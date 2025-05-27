import type { AbiEncodeAs } from '@ensdomains/ensjs/utils'
import {
  setAbiRecord as ensjs_setAbiRecord,
  type SetAbiRecordErrorType as ensjs_SetAbiRecordErrorType,
  type SetAbiRecordParameters as ensjs_SetAbiRecordParameters,
  type SetAbiRecordReturnType as ensjs_SetAbiRecordReturnType,
} from '@ensdomains/ensjs/wallet'
import { getConnectorClient, type Config, type SelectChains } from '@wagmi/core'
import type {
  ChainIdParameter,
  Compute,
  ConnectorParameter,
} from '@wagmi/core/internal'
import type { Account, Chain, Client } from 'viem'
import { getAction } from '../../utils/getAction.js'

export type SetAbiRecordParameters<
  encodeAs extends AbiEncodeAs = AbiEncodeAs,
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<
      ensjs_SetAbiRecordParameters<encodeAs, chains[key], Account, chains[key]>,
      'chain'
    > &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number]

export type SetAbiRecordReturnType = ensjs_SetAbiRecordReturnType

export type SetAbiRecordErrorType = ensjs_SetAbiRecordErrorType

export async function setAbiRecord<
  encodeAs extends AbiEncodeAs,
  config extends Config,
>(
  config: config,
  parameters: SetAbiRecordParameters<encodeAs, config>,
): Promise<SetAbiRecordReturnType> {
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

  const action = getAction(client, ensjs_setAbiRecord, 'setAbiRecord')
  return await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  })
}
