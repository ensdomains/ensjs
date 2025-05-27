import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  deleteSubname as ensjs_deleteSubname,
  type DeleteSubnameErrorType as ensjs_DeleteSubnameErrorType,
  type DeleteSubnameParameters as ensjs_DeleteSubnameParameters,
  type DeleteSubnameReturnType as ensjs_DeleteSubnameReturnType,
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

export type DeleteSubnameParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<ensjs_DeleteSubnameParameters<chains[key], Account, any>, 'chain'> &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number]

export type DeleteSubnameReturnType = ensjs_DeleteSubnameReturnType

export type DeleteSubnameErrorType = ensjs_DeleteSubnameErrorType

export async function deleteSubname<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensRegistry' | 'ensNameWrapper'>,
  parameters: DeleteSubnameParameters<ExcludeTE<typeof config>>,
): Promise<DeleteSubnameReturnType> {
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

  const action = getAction(client, ensjs_deleteSubname, 'deleteSubname')
  return await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  })
}
