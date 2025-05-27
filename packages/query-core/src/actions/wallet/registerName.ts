import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  registerName as ensjs_registerName,
  type RegisterNameErrorType as ensjs_RegisterNameErrorType,
  type RegisterNameParameters as ensjs_RegisterNameParameters,
  type RegisterNameReturnType as ensjs_RegisterNameReturnType,
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

export type RegisterNameParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<ensjs_RegisterNameParameters<chains[key], Account, any>, 'chain'> &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number]

export type RegisterNameReturnType = ensjs_RegisterNameReturnType

export type RegisterNameErrorType = ensjs_RegisterNameErrorType

export async function registerName<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<chains, 'ensEthRegistrarController'>,
  parameters: RegisterNameParameters<ExcludeTE<typeof config>>,
): Promise<RegisterNameReturnType> {
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

  const action = getAction(client, ensjs_registerName, 'registerName')
  return await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  })
}
