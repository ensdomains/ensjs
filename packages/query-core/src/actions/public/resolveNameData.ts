import {
  type ResolveNameDataErrorType as ensjs_ResolveNameDataErrorType,
  type ResolveNameDataParameters as ensjs_ResolveNameDataParameters,
  type ResolveNameDataReturnType as ensjs_ResolveNameDataReturnType,
  resolveNameData as ensjs_resolveNameData,
} from '@ensdomains/ensjs/public'
import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import type { Config } from '@wagmi/core'
import type { ChainIdParameter } from '@wagmi/core/internal'
import type { Chain, Hex, Prettify } from 'viem'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { getAction } from '../../utils/getAction.js'

export type ResolveNameDataParameters<
  data extends Hex | Hex[],
  config extends Config = Config,
> = Prettify<ensjs_ResolveNameDataParameters<data> & ChainIdParameter<config>>

export type ResolveNameDataReturnType<data extends Hex | Hex[]> =
  ensjs_ResolveNameDataReturnType<data>

export type ResolveNameDataErrorType = ensjs_ResolveNameDataErrorType

export function resolveNameData<
  chains extends readonly [Chain, ...Chain[]],
  data extends Hex | Hex[],
>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  parameters: ResolveNameDataParameters<data, ExcludeTE<typeof config>>,
): Promise<ResolveNameDataReturnType<data>> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_resolveNameData<typeof client.chain, data>,
    // TODO: Add resolveNameData to the client decorators
    // @ts-expect-error - Not yet added to decorator
    'resolveNameData',
  )
  return action(rest)
}
