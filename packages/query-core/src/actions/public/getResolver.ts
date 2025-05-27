import {
  type GetResolverErrorType as ensjs_GetResolverErrorType,
  type GetResolverParameters as ensjs_GetResolverParameters,
  type GetResolverReturnType as ensjs_GetResolverReturnType,
  getResolver as ensjs_getResolver,
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

export type GetResolverParameters<config extends Config = Config> = Prettify<
  ensjs_GetResolverParameters & ChainIdParameter<config>
>

export type GetResolverReturnType = ensjs_GetResolverReturnType

export type GetResolverErrorType = ensjs_GetResolverErrorType

export function getResolver<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<chains, 'ensRegistry'>,
  parameters: GetResolverParameters<ExcludeTE<typeof config>>,
): Promise<GetResolverReturnType> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getResolver<typeof client.chain>,
    'getResolver',
  )
  return action(rest)
}
