import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  type CommitNameErrorType as ensjs_CommitNameErrorType,
  type CommitNameParameters as ensjs_CommitNameParameters,
  type CommitNameReturnType as ensjs_CommitNameReturnType,
  commitName as ensjs_commitName,
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

export type CommitNameParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<ensjs_CommitNameParameters<chains[key], Account, any>, 'chain'> &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number]

export type CommitNameReturnType = ensjs_CommitNameReturnType

export type CommitNameErrorType = ensjs_CommitNameErrorType

export async function commitName<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<chains, 'ensEthRegistrarController'>,
  parameters: CommitNameParameters<ExcludeTE<typeof config>>,
): Promise<CommitNameReturnType> {
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

  const action = getAction(client, ensjs_commitName, 'commitName')
  return await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  })
}
