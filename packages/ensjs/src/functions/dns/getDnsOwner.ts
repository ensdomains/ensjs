import { Address, getAddress } from 'viem'
import {
  DnsDnssecVerificationFailedError,
  DnsInvalidAddressChecksumError,
  DnsInvalidTxtRecordError,
  DnsNoTxtRecordError,
  DnsResponseStatusError,
} from '../../errors/dns'
import { UnsupportedNameTypeError } from '../../errors/general'
import { getNameType } from '../../utils/getNameType'
import { Endpoint } from './types'

export type GetDnsOwnerParameters = {
  name: string
  endpoint?: Endpoint
}

export type GetDnsOwnerReturnType = Address

enum DnsResponseStatus {
  NOERROR = 0,
  FORMERR = 1,
  SERVFAIL = 2,
  NXDOMAIN = 3,
  NOTIMP = 4,
  REFUSED = 5,
  YXDOMAIN = 6,
  YXRRSET = 7,
  NXRRSET = 8,
  NOTAUTH = 9,
  NOTZONE = 10,
  DSOTYPENI = 11,
  BADVERS = 16,
  BADSIG = 16,
  BADKEY = 17,
  BADTIME = 18,
  BADMODE = 19,
  BADNAME = 20,
  BADALG = 21,
  BADTRUNC = 22,
  BADCOOKIE = 23,
}

enum DnsRecordType {
  TXT = 16,
  DS = 43,
  RRSIG = 46,
  DNSKEY = 48,
}

type DnsQuestionItem = {
  name: string
  type: DnsRecordType
}

type DnsResponseItem = DnsQuestionItem & {
  TTL: number
  data: string
}

type DnsResponse = {
  Status: DnsResponseStatus
  TC: boolean
  RD: boolean
  RA: boolean
  AD: boolean
  CD: boolean
  Question: DnsQuestionItem[]
  Answer?: DnsResponseItem[]
  Authority?: DnsResponseItem[]
  Additional?: DnsResponseItem[]
  Comment?: string
}

const getDnsOwner = async ({
  name,
  endpoint = 'https://cloudflare-dns.com/dns-query',
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

  if (response.Status !== DnsResponseStatus.NOERROR)
    throw new DnsResponseStatusError({
      responseStatus: DnsResponseStatus[response.Status],
    })

  const addressRecord = response.Answer?.find(
    (record) => record.type === DnsRecordType.TXT,
  )
  const unwrappedAddressRecord = addressRecord?.data?.replace(/^"(.*)"$/g, '$1')

  if (response.AD === false)
    throw new DnsDnssecVerificationFailedError({
      record: unwrappedAddressRecord,
    })

  if (!addressRecord?.data) throw new DnsNoTxtRecordError()

  if (!unwrappedAddressRecord!.match(/^a=0x[a-fA-F0-9]{40}$/g))
    throw new DnsInvalidTxtRecordError({ record: unwrappedAddressRecord! })

  const address = unwrappedAddressRecord!.slice(2)
  const checksumAddress = getAddress(address)

  if (address !== checksumAddress)
    throw new DnsInvalidAddressChecksumError({ address })

  return checksumAddress
}

export default getDnsOwner
