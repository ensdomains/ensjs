import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  type GetPriceErrorType as ensjs_GetPriceErrorType,
  type GetPriceParameters as ensjs_GetPriceParameters,
  type GetPriceReturnType as ensjs_GetPriceReturnType,
  getPrice as ensjs_getPrice,
} from '@ensdomains/ensjs/public'
import type { Config } from '@wagmi/core'
import type { ChainIdParameter } from '@wagmi/core/internal'
import type { Chain, Prettify } from 'viem'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { getAction } from '../../utils/getAction.js'

export type GetPriceParameters<config extends Config = Config> = Prettify<
  ensjs_GetPriceParameters & ChainIdParameter<config>
>

export type GetPriceReturnType = ensjs_GetPriceReturnType

export type GetPriceErrorType = ensjs_GetPriceErrorType

export function getPrice<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<
    chains,
    'ensEthRegistrarController' | 'multicall3'
  >,
  parameters: GetPriceParameters<ExcludeTE<typeof config>>,
): Promise<GetPriceReturnType> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getPrice<typeof client.chain>,
    'getPrice',
  )
  return action(rest)
}
