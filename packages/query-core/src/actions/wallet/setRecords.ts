import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  type SetRecordsErrorType as ensjs_SetRecordsErrorType,
  type SetRecordsParameters as ensjs_SetRecordsParameters,
  type SetRecordsReturnType as ensjs_SetRecordsReturnType,
  setRecords as ensjs_setRecords,
} from '@ensdomains/ensjs/wallet'
import { type Config, getConnectorClient, type SelectChains } from '@wagmi/core'
import type {
  ChainIdParameter,
  Compute,
  ConnectorParameter,
} from '@wagmi/core/internal'
import type { Account, Chain, Client } from 'viem'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { getAction } from '../../utils/getAction.js'

export type SetRecordsParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<ensjs_SetRecordsParameters<chains[key], Account, any>, 'chain'> &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number]

export type SetRecordsReturnType = ensjs_SetRecordsReturnType

export type SetRecordsErrorType = ensjs_SetRecordsErrorType

export async function setRecords<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<chains, 'ensPublicResolver'>,
  parameters: SetRecordsParameters<ExcludeTE<typeof config>>,
): Promise<SetRecordsReturnType> {
  ASSERT_NO_TYPE_ERROR(config)

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

  const action = getAction(client, ensjs_setRecords, 'setRecords')
  return await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  })
}
