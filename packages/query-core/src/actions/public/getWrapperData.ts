import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  type GetWrapperDataErrorType as ensjs_GetWrapperDataErrorType,
  type GetWrapperDataParameters as ensjs_GetWrapperDataParameters,
  type GetWrapperDataReturnType as ensjs_GetWrapperDataReturnType,
  getWrapperData as ensjs_getWrapperData,
} from '@ensdomains/ensjs/public'
import type { Config } from '@wagmi/core'
import type { ChainIdParameter } from '@wagmi/core/internal'
import type { Chain, Prettify } from 'viem'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { getAction } from '../../utils/getAction.js'

export type GetWrapperDataParameters<config extends Config = Config> = Prettify<
  ensjs_GetWrapperDataParameters & ChainIdParameter<config>
>

export type GetWrapperDataReturnType = ensjs_GetWrapperDataReturnType

export type GetWrapperDataErrorType = ensjs_GetWrapperDataErrorType

export function getWrapperData<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<chains, 'ensNameWrapper' | 'multicall3'>,
  parameters: GetWrapperDataParameters<ExcludeTE<typeof config>>,
): Promise<GetWrapperDataReturnType> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getWrapperData<typeof client.chain>,
    'getWrapperData',
  )
  return action(rest)
}
