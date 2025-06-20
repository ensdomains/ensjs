import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  type SetResolverErrorType as ensjs_SetResolverErrorType,
  type SetResolverParameters as ensjs_SetResolverParameters,
  type SetResolverReturnType as ensjs_SetResolverReturnType,
  setResolver as ensjs_setResolver,
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

export type SetResolverParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<ensjs_SetResolverParameters<chains[key], Account, any>, 'chain'> &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number]

export type SetResolverReturnType = ensjs_SetResolverReturnType

export type SetResolverErrorType = ensjs_SetResolverErrorType

export async function setResolver<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<chains, 'ensRegistry' | 'ensNameWrapper'>,
  parameters: SetResolverParameters<ExcludeTE<typeof config>>,
): Promise<SetResolverReturnType> {
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

  const action = getAction(client, ensjs_setResolver, 'setResolver')
  return await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  })
}
