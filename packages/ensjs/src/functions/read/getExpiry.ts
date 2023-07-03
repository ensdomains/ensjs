import { Hex, decodeFunctionResult, encodeFunctionData, labelhash } from 'viem'
import {
  gracePeriodSnippet,
  nameExpiresSnippet,
} from '../../contracts/baseRegistrar'
import { ClientWithEns } from '../../contracts/consts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { getCurrentBlockTimestampSnippet } from '../../contracts/multicall'
import { getDataSnippet } from '../../contracts/nameWrapper'
import { DateWithValue, Prettify, SimpleTransactionRequest } from '../../types'
import {
  GeneratedFunction,
  generateFunction,
} from '../../utils/generateFunction'
import { makeSafeSecondsDate } from '../../utils/makeSafeSecondsDate'
import { namehash } from '../../utils/normalise'
import { checkIsDotEth } from '../../utils/validation'
import multicallWrapper from './multicallWrapper'

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
  expiry: DateWithValue<bigint>
  /** Grace period value (in seconds) */
  gracePeriod: number
  /** Status of name */
  status: ExpiryStatus
} | null>

const getContractToUse = (
  contract: ContractOption | undefined,
  labels: string[],
) => {
  if (contract) return contract
  if (checkIsDotEth(labels)) {
    return 'registrar'
  }
  return 'nameWrapper'
}

const encode = (
  client: ClientWithEns,
  { name, contract }: GetExpiryParameters,
): SimpleTransactionRequest => {
  const labels = name.split('.')

  const contractToUse = getContractToUse(contract, labels)

  const calls: SimpleTransactionRequest[] = [
    {
      to: getChainContractAddress({ client, contract: 'multicall3' }),
      data: encodeFunctionData({
        abi: getCurrentBlockTimestampSnippet,
        functionName: 'getCurrentBlockTimestamp',
      }),
    },
  ]

  if (contractToUse === 'nameWrapper') {
    calls.push({
      to: getChainContractAddress({ client, contract: 'ensNameWrapper' }),
      data: encodeFunctionData({
        abi: getDataSnippet,
        functionName: 'getData',
        args: [BigInt(namehash(labels.join('.')))],
      }),
    })
  } else {
    const baseRegistrarImplementationAddress = getChainContractAddress({
      client,
      contract: 'ensBaseRegistrarImplementation',
    })
    calls.push({
      to: baseRegistrarImplementationAddress,
      data: encodeFunctionData({
        abi: nameExpiresSnippet,
        functionName: 'nameExpires',
        args: [BigInt(labelhash(labels[0]))],
      }),
    })
    calls.push({
      to: baseRegistrarImplementationAddress,
      data: encodeFunctionData({
        abi: gracePeriodSnippet,
        functionName: 'GRACE_PERIOD',
      }),
    })
  }

  return multicallWrapper.encode(client, { transactions: calls })
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
  { name, contract }: GetExpiryParameters,
): Promise<GetExpiryReturnType> => {
  const labels = name.split('.')
  const result = await multicallWrapper.decode(client, data, [])

  const blockTimestamp = decodeFunctionResult({
    abi: getCurrentBlockTimestampSnippet,
    functionName: 'getCurrentBlockTimestamp',
    data: result[0].returnData,
  })

  const contractToUse = getContractToUse(contract, labels)

  let expiry: bigint
  let gracePeriod: bigint = 0n

  if (contractToUse === 'nameWrapper') {
    ;[, , expiry] = decodeFunctionResult({
      abi: getDataSnippet,
      functionName: 'getData',
      data: result[1].returnData,
    })
  } else {
    expiry = decodeFunctionResult({
      abi: nameExpiresSnippet,
      functionName: 'nameExpires',
      data: result[1].returnData,
    })
    gracePeriod = decodeFunctionResult({
      abi: gracePeriodSnippet,
      functionName: 'GRACE_PERIOD',
      data: result[2].returnData,
    })
  }

  if (expiry === 0n) {
    return null
  }

  let status: ExpiryStatus = 'active'

  if (blockTimestamp > expiry + gracePeriod) {
    status = 'expired'
  } else if (blockTimestamp > expiry) {
    status = 'gracePeriod'
  }

  return {
    expiry: {
      date: makeSafeSecondsDate(expiry),
      value: expiry,
    },
    gracePeriod: Number(gracePeriod),
    status,
  }
}

type BatchableFunctionObject = GeneratedFunction<typeof encode, typeof decode>

/**
 * Gets the expiry for a name
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetExpiryParameters}
 * @returns Expiry object, or `null` if no expiry. {@link GetExpiryReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts, getExpiry } from '@ensdomains/ensjs'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getExpiry(client, { name: 'ens.eth' })
 * // { expiry: { date: Date, value: 1913933217n }, gracePeriod: 7776000, status: 'active' }
 */
const getExpiry = generateFunction({ encode, decode }) as ((
  client: ClientWithEns,
  { name, contract }: GetExpiryParameters,
) => Promise<GetExpiryReturnType>) &
  BatchableFunctionObject

export default getExpiry
