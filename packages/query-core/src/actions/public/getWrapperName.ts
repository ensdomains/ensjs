import {
  type GetWrapperNameErrorType as ensjs_GetWrapperNameErrorType,
  type GetWrapperNameParameters as ensjs_GetWrapperNameParameters,
  type GetWrapperNameReturnType as ensjs_GetWrapperNameReturnType,
  getWrapperName as ensjs_getWrapperName,
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

export type GetWrapperNameParameters<config extends Config = Config> = Prettify<
  ensjs_GetWrapperNameParameters & ChainIdParameter<config>
>

export type GetWrapperNameReturnType = ensjs_GetWrapperNameReturnType

export type GetWrapperNameErrorType = ensjs_GetWrapperNameErrorType

export function getWrapperName<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<chains, 'ensNameWrapper'>,
  parameters: GetWrapperNameParameters<ExcludeTE<typeof config>>,
): Promise<GetWrapperNameReturnType> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getWrapperName<typeof client.chain>,
    'getWrapperName',
  )
  return action(rest)
}
