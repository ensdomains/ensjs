import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  type GetAvailableErrorType as ensjs_GetAvailableErrorType,
  type GetAvailableParameters as ensjs_GetAvailableParameters,
  type GetAvailableReturnType as ensjs_GetAvailableReturnType,
  getAvailable as ensjs_getAvailable,
} from '@ensdomains/ensjs/public'
import type { Config } from '@wagmi/core'
import type { ChainIdParameter } from '@wagmi/core/internal'
import type { Chain, Prettify } from 'viem'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { getAction } from '../../utils/getAction.js'

export type GetAvailableParameters<config extends Config = Config> = Prettify<
  ensjs_GetAvailableParameters & ChainIdParameter<config>
>

export type GetAvailableReturnType = ensjs_GetAvailableReturnType

export type GetAvailableErrorType = ensjs_GetAvailableErrorType

export function getAvailable<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<chains, 'ensBaseRegistrarImplementation'>,
  parameters: GetAvailableParameters<ExcludeTE<typeof config>>,
): Promise<GetAvailableReturnType> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getAvailable<typeof client.chain>,
    'getAvailable',
  )
  return action(rest)
}
