import {
  type GetCredentialsErrorType as ensjs_GetCredentialsErrorType,
  type GetCredentialsParameters as ensjs_GetCredentialsParameters,
  type GetCredentialsReturnType as ensjs_GetCredentialsReturnType,
  getCredentials as ensjs_getCredentials,
} from '@ensdomains/ensjs/public'
import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import type { Config } from '@wagmi/core'
import type { ChainIdParameter } from '@wagmi/core/internal'
import type { Chain, Prettify } from 'viem'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { getAction } from '../../utils/getAction.js'

export type GetCredentialsParameters<config extends Config = Config> = Prettify<
  ensjs_GetCredentialsParameters & ChainIdParameter<config>
>

export type GetCredentialsReturnType = ensjs_GetCredentialsReturnType

export type GetCredentialsErrorType = ensjs_GetCredentialsErrorType

export function getCredentials<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  parameters: GetCredentialsParameters<ExcludeTE<typeof config>>,
): Promise<GetCredentialsReturnType> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getCredentials<typeof client.chain>,
    'getCredentials',
  )
  return action(rest)
}
