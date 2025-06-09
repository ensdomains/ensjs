import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  type GetTextRecordErrorType as ensjs_GetTextRecordErrorType,
  type GetTextRecordParameters as ensjs_GetTextRecordParameters,
  type GetTextRecordReturnType as ensjs_GetTextRecordReturnType,
  getTextRecord as ensjs_getTextRecord,
} from '@ensdomains/ensjs/public'
import type { Config } from '@wagmi/core'
import type { ChainIdParameter } from '@wagmi/core/internal'
import type { Chain, Prettify } from 'viem'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { getAction } from '../../utils/getAction.js'

export type GetTextRecordParameters<config extends Config = Config> = Prettify<
  ensjs_GetTextRecordParameters & ChainIdParameter<config>
>

export type GetTextRecordReturnType = ensjs_GetTextRecordReturnType

export type GetTextRecordErrorType = ensjs_GetTextRecordErrorType

export function getTextRecord<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  parameters: GetTextRecordParameters<ExcludeTE<typeof config>>,
): Promise<GetTextRecordReturnType> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getTextRecord<typeof client.chain>,
    'getTextRecord',
  )
  return action(rest)
}
