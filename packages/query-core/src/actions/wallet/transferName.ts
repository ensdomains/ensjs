import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  transferName as ensjs_transferName,
  type TransferNameErrorType as ensjs_TransferNameErrorType,
  type TransferNameParameters as ensjs_TransferNameParameters,
  type TransferNameReturnType as ensjs_TransferNameReturnType,
  type TransferNameSupportedContract,
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

export type TransferNameParameters<
  contract extends TransferNameSupportedContract,
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<
      ensjs_TransferNameParameters<contract, chains[key], Account, any>,
      'chain'
    > &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number]

export type TransferNameReturnType = ensjs_TransferNameReturnType

export type TransferNameErrorType = ensjs_TransferNameErrorType

export async function transferName<
  contract extends TransferNameSupportedContract,
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<
    chains,
    'ensRegistry' | 'ensNameWrapper' | 'ensBaseRegistrarImplementation'
  >,
  parameters: TransferNameParameters<contract, ExcludeTE<typeof config>>,
): Promise<TransferNameReturnType> {
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

  const action = getAction(client, ensjs_transferName, 'transferName')
  return await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  })
}
