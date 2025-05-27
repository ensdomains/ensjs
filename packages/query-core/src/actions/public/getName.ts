import {
  type GetNameErrorType as ensjs_GetNameErrorType,
  type GetNameParameters as ensjs_GetNameParameters,
  type GetNameReturnType as ensjs_GetNameReturnType,
  getName as ensjs_getName,
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

export type GetNameParameters<config extends Config = Config> = Prettify<
  ensjs_GetNameParameters & ChainIdParameter<config>
>

export type GetNameReturnType = ensjs_GetNameReturnType

export type GetNameErrorType = ensjs_GetNameErrorType

export function getName<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  parameters: GetNameParameters<ExcludeTE<typeof config>>,
): Promise<GetNameReturnType> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getName<typeof client.chain>,
    'getName',
  )
  return action(rest)
}
