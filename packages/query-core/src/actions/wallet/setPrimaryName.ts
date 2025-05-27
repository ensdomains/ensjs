import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  setPrimaryName as ensjs_setPrimaryName,
  type SetPrimaryNameErrorType as ensjs_SetPrimaryNameErrorType,
  type SetPrimaryNameParameters as ensjs_SetPrimaryNameParameters,
  type SetPrimaryNameReturnType as ensjs_SetPrimaryNameReturnType,
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

export type SetPrimaryNameParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<ensjs_SetPrimaryNameParameters<chains[key], Account, any>, 'chain'> &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number]

export type SetPrimaryNameReturnType = ensjs_SetPrimaryNameReturnType

export type SetPrimaryNameErrorType = ensjs_SetPrimaryNameErrorType

export async function setPrimaryName<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<
    chains,
    'ensPublicResolver' | 'ensReverseRegistrar'
  >,
  parameters: SetPrimaryNameParameters<ExcludeTE<typeof config>>,
): Promise<SetPrimaryNameReturnType> {
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

  const action = getAction(client, ensjs_setPrimaryName, 'setPrimaryName')
  return await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  })
}
