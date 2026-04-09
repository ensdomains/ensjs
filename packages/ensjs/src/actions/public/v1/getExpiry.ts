import {
  type Chain,
  type GetChainContractAddressErrorType,
  type LabelhashErrorType,
  labelhash,
  type MulticallErrorType,
  type NamehashErrorType,
  namehash,
} from 'viem'
import { multicall } from 'viem/actions'
import { getAction } from 'viem/utils'
import type { RequireClientContracts } from '../../../clients/shared.js'
import { getChainContractAddress } from '../../../clients/shared.js'
import {
  baseRegistrarGracePeriodSnippet,
  baseRegistrarNameExpiresSnippet,
} from '@ensdomains/ensjs-abi/v1/baseRegistrar'
import { multicallGetCurrentBlockTimestampSnippet } from '@ensdomains/ensjs-abi/multicall'
import { nameWrapperGetDataSnippet } from '@ensdomains/ensjs-abi/v1/nameWrapper'
import { UnsupportedNameTypeError } from '../../../errors/general.js'
import type { Prettify } from '../../../types/index.js'
import type { ExcludeTE } from '../../../types/internal.js'
import { getNameType } from '../../../utils/name/getNameType.js'
import { checkIsDotEth } from '../../../utils/name/validation.js'

type ContractOption = 'registrar' | 'nameWrapper'
type ExpiryStatus = 'active' | 'expired' | 'gracePeriod'

export type GetExpiryParameters = Prettify<{
  /** Name to get expiry for */
  name: string
  /** Optional specific contract to use to get expiry */
  contract?: ContractOption
}>

export type GetExpiryReturnType = Prettify<{
  /** Expiry value */
  expiry: bigint
  /** Grace period value (in seconds) */
  gracePeriod: number
  /** Status of name */
  status: ExpiryStatus
} | null>

export type GetExpiryErrorType =
  | MulticallErrorType
  | GetChainContractAddressErrorType
  | NamehashErrorType
  | LabelhashErrorType

/**
 * Gets the expiry for a name
 * @param client - {@link Client}
 * @param parameters - {@link GetExpiryParameters}
 * @returns Expiry object, or `null` if no expiry. {@link GetExpiryReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getExpiry } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getExpiry(client, { name: 'ens.eth' })
 * // { expiry: { date: Date, value: 1913933217n }, gracePeriod: 7776000, status: 'active' }

 */
export async function getExpiry<chain extends Chain>(
  client: RequireClientContracts<
    chain,
    | 'ensNameWrapper'
    | 'ensBaseRegistrarImplementation'
    | 'ensRegistry'
    | 'multicall3'
  >,
  { name, contract: contractOption }: GetExpiryParameters,
): Promise<GetExpiryReturnType> {
  const chain = (client as ExcludeTE<typeof client>).chain
  const labels = name.split('.')
  const contract = (() => {
    if (contractOption) {
      if (contractOption === 'registrar' && !checkIsDotEth(labels))
        throw new UnsupportedNameTypeError({
          nameType: getNameType(name),
          supportedNameTypes: ['eth-2ld', 'tld'],
          details:
            'Only the expiry of eth-2ld names can be fetched when using the registrar contract',
        })
      return contractOption
    }
    if (checkIsDotEth(labels)) return 'registrar'
    return 'nameWrapper'
  })()

  const multicallAction = getAction(
    client as ExcludeTE<typeof client>,
    multicall,
    'multicall',
  )

  const getCurrentBlockTimestampParameters = {
    address: getChainContractAddress({
      chain,
      contract: 'multicall3',
    }),
    abi: multicallGetCurrentBlockTimestampSnippet,
    functionName: 'getCurrentBlockTimestamp',
  } as const

  const [currentBlockTimestamp, expiry, gracePeriod] = await (async () => {
    if (contract === 'nameWrapper') {
      const [timestamp_, [, , expiry_]] = await multicallAction({
        contracts: [
          getCurrentBlockTimestampParameters,
          {
            address: getChainContractAddress({
              chain,
              contract: 'ensNameWrapper',
            }),
            abi: nameWrapperGetDataSnippet,
            functionName: 'getData',
            args: [BigInt(namehash(name))],
          },
        ],
        allowFailure: false,
      })
      return [timestamp_, expiry_, 0n] as const
    }

    return await multicallAction({
      contracts: [
        getCurrentBlockTimestampParameters,
        {
          address: getChainContractAddress({
            chain,
            contract: 'ensBaseRegistrarImplementation',
          }),
          abi: baseRegistrarNameExpiresSnippet,
          functionName: 'nameExpires',
          args: [BigInt(labelhash(labels[0]))],
        },
        {
          address: getChainContractAddress({
            chain,
            contract: 'ensBaseRegistrarImplementation',
          }),
          abi: baseRegistrarGracePeriodSnippet,
          functionName: 'GRACE_PERIOD',
        },
      ],
      allowFailure: false,
    })
  })()

  if (expiry === 0n) return null

  const status = (() => {
    if (currentBlockTimestamp > expiry + gracePeriod) return 'expired'
    if (currentBlockTimestamp > expiry) return 'gracePeriod'
    return 'active'
  })()

  return {
    expiry,
    gracePeriod: Number(gracePeriod),
    status,
  }
}
