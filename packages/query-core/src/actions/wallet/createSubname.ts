import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  type CreateSubnameErrorType as ensjs_CreateSubnameErrorType,
  type CreateSubnameParameters as ensjs_CreateSubnameParameters,
  type CreateSubnameReturnType as ensjs_CreateSubnameReturnType,
  createSubname as ensjs_createSubname,
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

export type CreateSubnameParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<ensjs_CreateSubnameParameters<chains[key], Account, any>, 'chain'> &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number]

export type CreateSubnameReturnType = ensjs_CreateSubnameReturnType

export type CreateSubnameErrorType = ensjs_CreateSubnameErrorType

export async function createSubname<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<
    chains,
    'ensNameWrapper' | 'ensPublicResolver'
  >,
  parameters: CreateSubnameParameters<ExcludeTE<typeof config>>,
): Promise<CreateSubnameReturnType> {
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

  const action = getAction(client, ensjs_createSubname, 'createSubname')
  return await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  })
}
