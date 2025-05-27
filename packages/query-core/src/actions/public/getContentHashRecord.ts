import {
  type GetContentHashRecordErrorType as ensjs_GetContentHashRecordErrorType,
  type GetContentHashRecordParameters as ensjs_GetContentHashRecordParameters,
  type GetContentHashRecordReturnType as ensjs_GetContentHashRecordReturnType,
  getContentHashRecord as ensjs_getContentHashRecord,
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

export type GetContentHashRecordParameters<config extends Config = Config> =
  Prettify<ensjs_GetContentHashRecordParameters & ChainIdParameter<config>>

export type GetContentHashRecordReturnType =
  ensjs_GetContentHashRecordReturnType

export type GetContentHashRecordErrorType = ensjs_GetContentHashRecordErrorType

export function getContentHashRecord<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  parameters: GetContentHashRecordParameters<ExcludeTE<typeof config>>,
): Promise<GetContentHashRecordReturnType> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getContentHashRecord<typeof client.chain>,
    'getContentHashRecord',
  )
  return action(rest)
}
