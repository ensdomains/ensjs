import { getAddress, type Address } from 'viem'
import {
  DnsDnssecVerificationFailedError,
  DnsInvalidAddressChecksumError,
  DnsInvalidTxtRecordError,
  DnsNoTxtRecordError,
  DnsResponseStatusError,
} from '../../errors/dns.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import {
  DnsRecordType,
  DnsResponseStatus,
  type DnsResponse,
} from '../../utils/dns.js'
import { getNameType } from '../../utils/getNameType.js'
import type { Endpoint } from './types.js'

export type GetDnsOwnerParameters = {
  /** Name to get the owner for */
  name: string
  /** An RFC-1035 compatible DNS endpoint to use (default: `https://cloudflare-dns.com/dns-query`) */
  endpoint?: Endpoint
  /** Whether or not to throw errors */
  strict?: boolean
}

export type GetDnsOwnerReturnType = Address | null

/**
 * Gets the DNS owner of a name, via DNS record lookup
 * @param parameters - {@link GetDnsOwnerParameters}
 * @returns Address of DNS owner. {@link GetDnsOwnerReturnType}
 *
 * @example
 * import { getDnsOwner } from '@ensdomains/ensjs/dns'
 *
 * const owner = await getDnsOwner({ name: 'ens.domains' })
 * // '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5'
 */
const getDnsOwner = async ({
  name,
  endpoint = 'https://cloudflare-dns.com/dns-query',
  strict,
}: GetDnsOwnerParameters): Promise<GetDnsOwnerReturnType> => {
  const nameType = getNameType(name)

  if (nameType !== 'other-2ld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['other-2ld'],
    })

  const response: DnsResponse = await fetch(
    `${endpoint}?name=_ens.${name}.&type=TXT`,
    {
      method: 'GET',
      headers: {
        accept: 'application/dns-json',
      },
    },
  ).then((res) => res.json())

  if (response.Status !== DnsResponseStatus.NOERROR) {
    if (!strict) return null
    throw new DnsResponseStatusError({
      responseStatus: DnsResponseStatus[response.Status],
    })
  }

  const addressRecord = response.Answer?.find(
    (record) => record.type === DnsRecordType.TXT,
  )
  const unwrappedAddressRecord = addressRecord?.data?.replace(/^"(.*)"$/g, '$1')

  if (response.AD === false) {
    if (!strict) return null
    throw new DnsDnssecVerificationFailedError({
      record: unwrappedAddressRecord,
    })
  }

  if (!addressRecord?.data) {
    if (!strict) return null
    throw new DnsNoTxtRecordError()
  }

  if (!unwrappedAddressRecord!.match(/^a=0x[a-fA-F0-9]{40}$/g)) {
    if (!strict) return null
    throw new DnsInvalidTxtRecordError({ record: unwrappedAddressRecord! })
  }

  const address = unwrappedAddressRecord!.slice(2)
  const checksumAddress = getAddress(address)

  if (address !== checksumAddress) {
    if (!strict) return null
    throw new DnsInvalidAddressChecksumError({ address })
  }

  return checksumAddress
}

export default getDnsOwner
