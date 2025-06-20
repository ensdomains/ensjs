import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import {
  type GetSupportedInterfacesErrorType as ensjs_GetSupportedInterfacesErrorType,
  type GetSupportedInterfacesParameters as ensjs_GetSupportedInterfacesParameters,
  type GetSupportedInterfacesReturnType as ensjs_GetSupportedInterfacesReturnType,
  getSupportedInterfaces as ensjs_getSupportedInterfaces,
} from '@ensdomains/ensjs/public'
import type { Config } from '@wagmi/core'
import type { ChainIdParameter } from '@wagmi/core/internal'
import type { Chain, Hex, Prettify } from 'viem'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { getAction } from '../../utils/getAction.js'

export type GetSupportedInterfacesParameters<
  config extends Config = Config,
  interfaces extends readonly Hex[] = readonly Hex[],
> = Prettify<
  ensjs_GetSupportedInterfacesParameters<interfaces> & ChainIdParameter<config>
>

export type GetSupportedInterfacesReturnType<
  interfaces extends readonly Hex[] = readonly Hex[],
> = ensjs_GetSupportedInterfacesReturnType<interfaces>

export type GetSupportedInterfacesErrorType =
  ensjs_GetSupportedInterfacesErrorType

export function getSupportedInterfaces<
  chains extends readonly [Chain, ...Chain[]],
  const interfaces extends readonly Hex[],
>(
  config: RequireConfigContracts<chains, 'multicall3'>,
  parameters: GetSupportedInterfacesParameters<
    ExcludeTE<typeof config>,
    interfaces
  >,
): Promise<GetSupportedInterfacesReturnType<interfaces>> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getSupportedInterfaces<typeof client.chain, interfaces>,
    // TODO: Add getSupportedInterfaces to the client decorators
    // @ts-expect-error - Not yet added to decorator
    'getSupportedInterfaces',
  )
  return action(rest)
}
