import * as packet from 'dns-packet'

import { ENSArgs } from '..'

function encodeURLParams(p: { [key: string]: string }): string {
    return Object.entries(p)
      .map((kv) => kv.map(encodeURIComponent).join('='))
      .join('&')
  }
  
  // sendQuery
  const getDNS = async (q: packet.Packet): Promise<packet.Packet> => {
    const url = 'https://cloudflare-dns.com/dns-query'
  
    const buf = packet.encode(q)
    const response = await fetch(
      `${url}?${encodeURLParams({
        ct: 'application/dns-udpwireformat',
        dns: buf.toString('base64'),
        ts: Date.now().toString(),
      })}`,
    )
    // @ts-ignore:next-line
    return packet.decode(Buffer.from(await response.arrayBuffer()))
  }
  
  const dnsQuery = async (
    qtype: string,
    qname: string,
  ): Promise<packet.Packet> => {
    const query: packet.Packet = {
      type: 'query',
      id: 1,
      flags: packet.RECURSION_DESIRED,
      questions: [
        {
          type: qtype,
          class: 'IN',
          name: qname,
        },
      ],
      additionals: [
        {
          type: 'OPT',
          class: 'IN',
          name: '.',
          udpPayloadSize: 4096,
          flags: packet.DNSSEC_OK,
        },
      ],
      answers: [],
    }
  
    const response = await getDNS(query)
    if (response.rcode !== 'NOERROR') {
      throw new Error(`DNS query failed: ${response.rcode}`)
    }
    return response
  }

export default async function (
    { getName }: ENSArgs<'getName'>,
    dnsName: string,
) {
    const result = await dnsQuery('TXT', `$ens.${dnsName}`)
    const address = result?.answers?.[0]?.data?.[0]?.toString()?.split('=')?.[1]
    const name = getName(address);
    return {
        address, name 
    }
}
