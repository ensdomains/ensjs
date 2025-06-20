import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import type { QueryOptions } from '@tanstack/query-core'
import type { Config } from '@wagmi/core'
import type {
  Compute,
  ExactPartial,
  ScopeKeyParameter,
} from '@wagmi/core/internal'
import type { Chain, Hex } from 'viem'
import {
  type GetSupportedInterfacesErrorType,
  type GetSupportedInterfacesParameters,
  type GetSupportedInterfacesReturnType,
  getSupportedInterfaces,
} from '../../actions/public/getSupportedInterfaces.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type GetSupportedInterfacesOptions<
  config extends Config,
  interfaces extends readonly Hex[] = readonly Hex[],
> = Compute<
  ExactPartial<GetSupportedInterfacesParameters<config, interfaces>> &
    ScopeKeyParameter
>

export function getSupportedInterfacesQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
  const interfaces extends readonly Hex[],
>(
  config: RequireConfigContracts<chains, 'multicall3'>,
  options: GetSupportedInterfacesOptions<
    ExcludeTE<typeof config>,
    interfaces
  > = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { address, interfaces, scopeKey: _, ...parameters } = queryKey[1]
      if (!address) throw new Error('address is required')
      if (!interfaces) throw new Error('interfaces is required')
      return getSupportedInterfaces<chains, interfaces>(config, {
        ...parameters,
        address,
        interfaces,
      })
    },
    queryKey: getSupportedInterfacesQueryKey(options),
  } as const satisfies QueryOptions<
    GetSupportedInterfacesQueryFnData<interfaces>,
    GetSupportedInterfacesErrorType,
    GetSupportedInterfacesData<interfaces>,
    GetSupportedInterfacesQueryKey<typeof config, interfaces>
  >
}

export type GetSupportedInterfacesQueryFnData<
  interfaces extends readonly Hex[] = readonly Hex[],
> = GetSupportedInterfacesReturnType<interfaces>

export type GetSupportedInterfacesData<
  interfaces extends readonly Hex[] = readonly Hex[],
> = GetSupportedInterfacesQueryFnData<interfaces>

export function getSupportedInterfacesQueryKey<
  config extends Config,
  interfaces extends readonly Hex[] = readonly Hex[],
>(options: GetSupportedInterfacesOptions<config, interfaces> = {}) {
  return ['ensjs_supportedInterfaces', filterQueryOptions(options)] as const
}

export type GetSupportedInterfacesQueryKey<
  config extends Config,
  interfaces extends readonly Hex[] = readonly Hex[],
> = ReturnType<typeof getSupportedInterfacesQueryKey<config, interfaces>>
