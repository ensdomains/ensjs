import {
  type Chain,
  type GetChainContractAddressErrorType,
  type LabelhashErrorType,
  labelhash,
  type MulticallErrorType,
} from 'viem'
import { multicall } from 'viem/actions'
import { getAction } from 'viem/utils'
import {
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import {
  baseRegistrarGracePeriodSnippet,
  baseRegistrarNameExpiresSnippet,
} from '../../contracts/baseRegistrar.js'
import { multicallGetCurrentBlockTimestampSnippet } from '../../contracts/multicall.js'
import { nameWrapperGetDataSnippet } from '../../contracts/nameWrapper.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import type { Prettify } from '../../types/index.js'
import type { ExcludeTE } from '../../types/internal.js'
import { getNameType } from '../../utils/name/getNameType.js'
import { type NamehashErrorType, namehash } from '../../utils/name/namehash.js'
import { checkIsDotEth } from '../../utils/name/validation.js'

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
    'ensNameWrapper' | 'ensBaseRegistrarImplementation' | 'multicall3'
  >,
  { name, contract: contractOption }: GetExpiryParameters,
): Promise<GetExpiryReturnType> {
  client = client as ExcludeTE<typeof client>

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

  const multicallAction = getAction(client, multicall, 'multicall')

  const getCurrentBlockTimestampParameters = {
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'multicall3',
    }),
    abi: multicallGetCurrentBlockTimestampSnippet,
    functionName: 'getCurrentBlockTimestamp',
  } as const

  const [currentBlockTimestamp, expiry, gracePeriod] = await (() => {
    if (contract === 'nameWrapper')
      return multicallAction({
        contracts: [
          getCurrentBlockTimestampParameters,
          {
            address: getChainContractAddress({
              chain: client.chain,
              contract: 'ensNameWrapper',
            }),
            abi: nameWrapperGetDataSnippet,
            functionName: 'getData',
            args: [BigInt(namehash(name))],
          },
        ],
        allowFailure: false,
      }).then(([timestamp_, [, , expiry_]]) => {
        return [timestamp_, expiry_, 0n] as const
      })

    return multicallAction({
      contracts: [
        getCurrentBlockTimestampParameters,
        {
          address: getChainContractAddress({
            chain: client.chain,
            contract: 'ensBaseRegistrarImplementation',
          }),
          abi: baseRegistrarNameExpiresSnippet,
          functionName: 'nameExpires',
          args: [BigInt(labelhash(labels[0]))],
        },
        {
          address: getChainContractAddress({
            chain: client.chain,
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
