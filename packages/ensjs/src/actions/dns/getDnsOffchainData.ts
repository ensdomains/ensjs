import { type Address, type Chain, isAddress } from 'viem'
import type { RequireClientContracts } from '../../clients/chain.js'
import {
  DnsDnssecVerificationFailedError,
  DnsDnssecWildcardExpansionError,
  DnsInvalidTxtRecordError,
  DnsNoTxtRecordError,
  DnsResponseStatusError,
} from '../../errors/dns.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import { getDnsTxtRecords } from '../../utils/dns/getDnsTxtRecords.js'
import {
  DnsRecordType,
  type DnsResponseItem,
  DnsResponseStatus,
} from '../../utils/dns/misc.js'
import { getNameType } from '../../utils/name/getNameType.js'
import { getAddressRecord } from '../public/getAddressRecord.js'
import type { Endpoint } from './types.js'

export type GetDnsOffchainDataParameters = {
  /** Name to get the offchain data for */
  name: string
  /** An RFC-1035 compatible DNS endpoint to use (default: `https://cloudflare-dns.com/dns-query`) */
  endpoint?: Endpoint
  /** Whether or not to throw errors */
  strict?: boolean
}

export type GetDnsOffchainDataReturnType = {
  resolverAddress: Address
  extraData: string | null
} | null

export type GetDnsOffchainDataErrorType =
  | DnsDnssecVerificationFailedError
  | DnsDnssecWildcardExpansionError
  | DnsInvalidTxtRecordError
  | DnsNoTxtRecordError
  | DnsResponseStatusError
  | UnsupportedNameTypeError
  | Error

type ValidTextRecord = {
  isValid: true
  resolverAddress: Address
  extraData: string | null
}
type InvalidTextRecord = { isValid: false; recordData: string }

async function checkValidEnsTxtRecord<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensUniversalResolver'>,
  record: DnsResponseItem,
): Promise<InvalidTextRecord | ValidTextRecord | null> {
  if (record.type !== DnsRecordType.TXT) return null
  if (!record.data.startsWith('"ENS1 ')) return null

  const unwrappedRecordData = record.data.replace(/^"(.*)"$/g, '$1')

  const resolverAndExtraData = unwrappedRecordData.slice(5)
  const splitIndex = resolverAndExtraData.indexOf(' ')
  const resolverNameOrAddress =
    splitIndex === -1
      ? resolverAndExtraData
      : resolverAndExtraData.slice(0, splitIndex)
  const extraData =
    splitIndex === -1 ? null : resolverAndExtraData.slice(splitIndex + 1)

  if (isAddress(resolverNameOrAddress))
    return { isValid: true, resolverAddress: resolverNameOrAddress, extraData }

  const resolverAddress = await getAddressRecord(client, {
    name: resolverNameOrAddress,
    // force no ccip-read, since dnsregistrar doesn't allow resolvers with ccip-read addresses
    gatewayUrls: [],
  }).catch(() => null) // if ccip-read is attempted, an error will be thrown. we can just ignore it

  if (resolverAddress)
    return {
      isValid: true,
      resolverAddress: resolverAddress.value as Address,
      extraData,
    }

  return { isValid: false, recordData: unwrappedRecordData }
}

/**
 * Gets the DNS offchain data for a name, via DNS record lookup
 * @param client - {@link Client}
 * @param parameters - {@link GetDnsOffchainDataParameters}
 * @returns Resolver address and extra data, or null. {@link GetDnsOffchainDataReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getDnsOffchainData } from '@ensdomains/ensjs/dns'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const data = await getDnsOffchainData(client, {
 *   name: 'ethleaderboard.xyz',
 * })
 */
export async function getDnsOffchainData<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensUniversalResolver'>,
  { name, endpoint, strict }: GetDnsOffchainDataParameters,
): Promise<GetDnsOffchainDataReturnType> {
  const nameType = getNameType(name)

  if (nameType !== 'other-2ld' && nameType !== 'other-subname')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['other-2ld', 'other-subname'],
    })

  try {
    const response = await getDnsTxtRecords({ name, endpoint })

    if (response.Status !== DnsResponseStatus.NOERROR)
      throw new DnsResponseStatusError({
        responseStatus: DnsResponseStatus[response.Status],
      })

    if (response.AD === false)
      throw new DnsDnssecVerificationFailedError({ record: undefined })

    if (!response.Answer?.length) throw new DnsNoTxtRecordError()

    const labels = name.split('.')
    const rrsigRecord = response.Answer.find((record) => {
      if (record.type !== DnsRecordType.RRSIG) return false
      if (record.name !== name) return false
      if (!record.data.startsWith('TXT')) return false
      const [, , labelCount] = record.data.split(' ')
      // mismatching label count implies wildcard expansion, which is not supported
      return Number(labelCount) === labels.length
    })

    if (!rrsigRecord) throw new DnsDnssecWildcardExpansionError()

    const ensTxtRecords = await Promise.all(
      response.Answer.map((record) => checkValidEnsTxtRecord(client, record)),
    )

    const validRecord = ensTxtRecords.find(
      (record): record is ValidTextRecord => record?.isValid === true,
    )
    if (validRecord)
      return {
        resolverAddress: validRecord.resolverAddress,
        extraData: validRecord.extraData,
      }

    const invalidRecord = ensTxtRecords.find(
      (record): record is InvalidTextRecord => record?.isValid === false,
    )
    if (invalidRecord)
      throw new DnsInvalidTxtRecordError({ record: invalidRecord.recordData })

    throw new DnsNoTxtRecordError()
  } catch (error) {
    if (!strict) return null
    throw error
  }
}
