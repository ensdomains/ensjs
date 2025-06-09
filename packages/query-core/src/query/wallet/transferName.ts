import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import type { TransferNameSupportedContract } from '@ensdomains/ensjs/wallet'
import type { MutationOptions } from '@tanstack/query-core'
import type { Config } from '@wagmi/core'
import type {
  Compute,
  ExactPartial,
  ScopeKeyParameter,
} from '@wagmi/core/internal'
import type { Chain } from 'viem/chains'
import {
  type TransferNameErrorType,
  type TransferNameParameters,
  type TransferNameReturnType,
  transferName,
} from '../../actions/wallet/transferName.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type TransferNameOptions<
  contract extends TransferNameSupportedContract,
  config extends Config,
> = Compute<
  ExactPartial<TransferNameParameters<contract, config>> & ScopeKeyParameter
>

export function transferNameMutationOptions<
  contract extends TransferNameSupportedContract,
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<
    chains,
    'ensRegistry' | 'ensNameWrapper' | 'ensBaseRegistrarImplementation'
  >,
  options: TransferNameOptions<contract, ExcludeTE<typeof config>>,
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (
      variables: TransferNameParameters<contract, typeof config>,
    ) => {
      return transferName(config, variables)
    },
    mutationKey: transferNameMutationKey(options),
  } as const satisfies MutationOptions<
    TransferNameReturnType,
    TransferNameErrorType,
    TransferNameParameters<contract, typeof config>
  >
}

export function transferNameMutationKey<
  contract extends TransferNameSupportedContract,
  config extends Config,
>(options: TransferNameOptions<contract, config>) {
  return ['ensjs_transferName', filterQueryOptions(options)] as const
}

export type TransferNameMutationKey<
  contract extends TransferNameSupportedContract,
  config extends Config,
> = ReturnType<typeof transferNameMutationKey<contract, config>>
