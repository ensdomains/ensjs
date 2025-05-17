import { labelhash, type Client, type Transport } from 'viem'
import { multicall } from 'viem/actions'
import { getAction } from 'viem/utils'

import {
  baseRegistrarGracePeriodSnippet,
  baseRegistrarNameExpiresSnippet,
} from '../../contracts/baseRegistrar.js'
import type { ChainWithContract } from '../../contracts/consts.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { multicallGetCurrentBlockTimestampSnippet } from '../../contracts/multicall.js'
import { nameWrapperGetDataSnippet } from '../../contracts/nameWrapper.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import type { Prettify } from '../../types.js'
import { getNameType } from '../../utils/name/getNameType.js'
import { namehash } from '../../utils/name/normalise.js'
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

export type GetExpiryErrorType = Error

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
export async function getExpiry<
  chain extends ChainWithContract<
    'ensNameWrapper' | 'ensBaseRegistrarImplementation' | 'multicall3'
  >,
>(
  client: Client<Transport, chain>,
  { name, contract: contractOption }: GetExpiryParameters,
): Promise<GetExpiryReturnType> {
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
    address: getChainContractAddress({ client, contract: 'multicall3' }),
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
              client,
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
            client,
            contract: 'ensBaseRegistrarImplementation',
          }),
          abi: baseRegistrarNameExpiresSnippet,
          functionName: 'nameExpires',
          args: [BigInt(labelhash(labels[0]))],
        },
        {
          address: getChainContractAddress({
            client,
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
