import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  clearRecords as ensjs_clearRecords,
  type ClearRecordsErrorType as ensjs_ClearRecordsErrorType,
  type ClearRecordsParameters as ensjs_ClearRecordsParameters,
  type ClearRecordsReturnType as ensjs_ClearRecordsReturnType,
} from '@ensdomains/ensjs/wallet'
import { getConnectorClient, type Config, type SelectChains } from '@wagmi/core'
import type {
  ChainIdParameter,
  Compute,
  ConnectorParameter,
} from '@wagmi/core/internal'
import type { Account, Chain, Client, Transport } from 'viem'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { getAction } from '../../utils/getAction.js'

// export type GetAbiRecordParameters<config extends Config = Config> = Prettify<
// ensjs_ClearRecordsParameters & ChainIdParameter<config>
// >

export type ClearRecordsParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<
      ensjs_ClearRecordsParameters<chains[key], Account, chains[key]>,
      'chain'
    > &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number]

export type ClearRecordsReturnType = ensjs_ClearRecordsReturnType

export type ClearRecordsErrorType = ensjs_ClearRecordsErrorType

export async function clearRecords<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  parameters: ClearRecordsParameters<ExcludeTE<typeof config>>,
): Promise<ClearRecordsReturnType> {
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

  const action = getAction(client, ensjs_clearRecords, 'clearRecords')
  return await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  })
}
