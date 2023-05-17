import { Address, getAddress } from 'viem'

export type GetDnsOwnerParameters = {
  name: string
  endpoint?: `https://${string}` | `http://${string}`
}

export type GetDnsOwnerReturnType =
  | {
      address: Address
    }
  | {
      data: string | null
      error: string
    }

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
  RRSIG = 46,
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
  const labels = name.split('.')
  const isDotEth = labels[labels.length - 1] === 'eth'
  const largerThan2ld = labels.length > 2

  if (isDotEth) throw new Error('Only DNS domains are supported')
  if (largerThan2ld) throw new Error('Only TLDs and 2LDs are supported')

  const response: DnsResponse = await fetch(
    `${endpoint}?name=_ens.${name}.&type=TXT`,
    {
      method: 'GET',
      headers: {
        accept: 'application/dns-json',
      },
    },
  ).then((res) => res.json())

  const addressRecord = response.Answer?.find(
    (record) => record.type === DnsRecordType.TXT,
  )
  const unwrappedAddressRecord = addressRecord?.data?.replace(/^"(.*)"$/g, '$1')

  if (response.Status !== DnsResponseStatus.NOERROR)
    return {
      data: unwrappedAddressRecord ?? null,
      error:
        response.Comment ||
        `Error occurred: ${DnsResponseStatus[response.Status]}`,
    }

  if (response.AD === false)
    return {
      data: unwrappedAddressRecord ?? null,
      error: 'DNSSEC verification failed',
    }

  if (!addressRecord?.data)
    return {
      data: null,
      error: 'No TXT record found',
    }

  if (!unwrappedAddressRecord!.match(/^a=0x[a-fA-F0-9]{40}$/g))
    return {
      data: unwrappedAddressRecord!,
      error: 'Invalid TXT record',
    }

  const address = unwrappedAddressRecord!.slice(2)
  const checksumAddress = getAddress(address)

  if (address !== checksumAddress)
    return {
      data: address,
      error: 'Invalid checksum',
    }

  return {
    address: checksumAddress,
  }
}

export default getDnsOwner
