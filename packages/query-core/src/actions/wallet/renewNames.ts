import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  type RenewNamesErrorType as ensjs_RenewNamesErrorType,
  type RenewNamesParameters as ensjs_RenewNamesParameters,
  type RenewNamesReturnType as ensjs_RenewNamesReturnType,
  renewNames as ensjs_renewNames,
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

export type RenewNamesParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<ensjs_RenewNamesParameters<chains[key], Account, any>, 'chain'> &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number]

export type RenewNamesReturnType = ensjs_RenewNamesReturnType

export type RenewNamesErrorType = ensjs_RenewNamesErrorType

export async function renewNames<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<
    chains,
    'ensEthRegistrarController' | 'ensBulkRenewal'
  >,
  parameters: RenewNamesParameters<ExcludeTE<typeof config>>,
): Promise<RenewNamesReturnType> {
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

  const action = getAction(client, ensjs_renewNames, 'renewNames')
  return await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  })
}
