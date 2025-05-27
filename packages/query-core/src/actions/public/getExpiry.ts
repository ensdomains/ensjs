import {
  type GetExpiryErrorType as ensjs_GetExpiryErrorType,
  type GetExpiryParameters as ensjs_GetExpiryParameters,
  type GetExpiryReturnType as ensjs_GetExpiryReturnType,
  getExpiry as ensjs_getExpiry,
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

export type GetExpiryParameters<config extends Config = Config> = Prettify<
  ensjs_GetExpiryParameters & ChainIdParameter<config>
>

export type GetExpiryReturnType = ensjs_GetExpiryReturnType

export type GetExpiryErrorType = ensjs_GetExpiryErrorType

export function getExpiry<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<
    chains,
    'ensNameWrapper' | 'ensBaseRegistrarImplementation' | 'multicall3'
  >,
  parameters: GetExpiryParameters<ExcludeTE<typeof config>>,
): Promise<GetExpiryReturnType> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getExpiry<typeof client.chain>,
    'getExpiry',
  )
  return action(rest)
}
