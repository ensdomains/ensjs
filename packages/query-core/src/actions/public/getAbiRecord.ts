import {
  type GetAbiRecordErrorType as ensjs_GetAbiRecordErrorType,
  type GetAbiRecordParameters as ensjs_GetAbiRecordParameters,
  type GetAbiRecordReturnType as ensjs_GetAbiRecordReturnType,
  getAbiRecord as ensjs_getAbiRecord,
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

export type GetAbiRecordParameters<config extends Config = Config> = Prettify<
  ensjs_GetAbiRecordParameters & ChainIdParameter<config>
>

export type GetAbiRecordReturnType = ensjs_GetAbiRecordReturnType

export type GetAbiRecordErrorType = ensjs_GetAbiRecordErrorType

export function getAbiRecord<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  parameters: GetAbiRecordParameters<ExcludeTE<typeof config>>,
): Promise<GetAbiRecordReturnType> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getAbiRecord<typeof client.chain>,
    'getAbiRecord',
  )
  return action(rest)
}
