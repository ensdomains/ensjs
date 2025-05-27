import {
  type GetAddressRecordErrorType as ensjs_GetAddressRecordErrorType,
  type GetAddressRecordParameters as ensjs_GetAddressRecordParameters,
  type GetAddressRecordReturnType as ensjs_GetAddressRecordReturnType,
  getAddressRecord as ensjs_getAddressRecord,
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

export type GetAddressRecordParameters<config extends Config = Config> =
  Prettify<ensjs_GetAddressRecordParameters & ChainIdParameter<config>>

export type GetAddressRecordReturnType = ensjs_GetAddressRecordReturnType

export type GetAddressRecordErrorType = ensjs_GetAddressRecordErrorType

export function getAddressRecord<chains extends readonly [Chain, ...Chain[]]>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  parameters: GetAddressRecordParameters<ExcludeTE<typeof config>>,
): Promise<GetAddressRecordReturnType> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getAddressRecord<typeof client.chain>,
    'getAddressRecord',
  )
  return action(rest)
}
