import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  type GetOwnerErrorType as ensjs_GetOwnerErrorType,
  type GetOwnerParameters as ensjs_GetOwnerParameters,
  type GetOwnerReturnType as ensjs_GetOwnerReturnType,
  getOwner as ensjs_getOwner,
} from '@ensdomains/ensjs/public'
import type { Config } from '@wagmi/core'
import type { ChainIdParameter } from '@wagmi/core/internal'
import type { Chain, Prettify } from 'viem'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { getAction } from '../../utils/getAction.js'

export type GetOwnerParameters<config extends Config = Config> = Prettify<
  ensjs_GetOwnerParameters & ChainIdParameter<config>
>

export type GetOwnerReturnType = ensjs_GetOwnerReturnType

export type GetOwnerErrorType = ensjs_GetOwnerErrorType

export function getOwner<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<
    chains,
    | 'ensNameWrapper'
    | 'ensRegistry'
    | 'ensBaseRegistrarImplementation'
    | 'multicall3'
  >,
  parameters: GetOwnerParameters<ExcludeTE<typeof config>>,
): Promise<GetOwnerReturnType> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getOwner<typeof client.chain>,
    'getOwner',
  )
  return action(rest)
}
