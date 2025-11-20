import type { ProvableAnswer, SignedSet } from '@ensdomains/dnsprovejs'
import type * as packet from 'dns-packet'
import { type Client, type Hex, type Transport, toHex } from 'viem'
import { readContract } from 'viem/actions'
import type { ChainWithEns } from '../../contracts/consts.js'
import { dnssecImplVerifyRrSetSnippet } from '../../contracts/dnssecImpl.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { DnsNewerRecordTypeAvailableError } from '../../index.js'
import type { Endpoint } from './types.js'

export type GetDnsImportDataParameters = {
  /** Name to prepare for DNS import */
  name: string
  /** An RFC-1035 compatible DNS endpoint to use (default: `https://cloudflare-dns.com/dns-query`) */
  endpoint?: Endpoint
}

export type RrSetWithSig = {
  rrset: Hex
  sig: Hex
}

export type GetDnsImportDataReturnType = RrSetWithSig[]

// Compares two serial numbers using RFC1982 serial number math.
const serialNumberGt = (i1: number, i2: number): boolean =>
  (i1 < i2 && i2 - i1 > 0x7fffffff) || (i1 > i2 && i1 - i2 < 0x7fffffff)

const encodeProofs = (
  proofs: SignedSet<packet.Ds | packet.Dnskey | packet.Rtxt>[],
): RrSetWithSig[] =>
  proofs.map((proof) => ({
    rrset: toHex(proof.toWire(true)),
    sig: toHex(proof.signature.data.signature),
  }))

/**
 * Gets DNS import data, used for `importDnsName()`
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetDnsImportDataParameters}
 * @returns DNS import data object, used for proving the value of the `_ens` TXT record
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getDnsImportData } from '@ensdomains/ensjs/dns'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const data = await getDnsImportData(client, {
 *   name: 'example.eth',
 * })
 */
const getDnsImportData = async (
  client: Client<Transport, ChainWithEns>,
  {
    name,
    endpoint = 'https://cloudflare-dns.com/dns-query',
  }: GetDnsImportDataParameters,
): Promise<GetDnsImportDataReturnType> => {
  // 1. Entry point - Log input parameters
  console.log('[getDnsImportData] Entry:', { name, endpoint })

  const { DNSProver } = await import('@ensdomains/dnsprovejs')
  const prover = DNSProver.create(endpoint)

  // 2. DNS query initiation
  console.log('[getDnsImportData] Initiating DNS query:', { type: 'TXT', query: `_ens.${name}` })

  const result = (await prover.queryWithProof(
    'TXT',
    `_ens.${name}`,
  )) as ProvableAnswer<packet.Rtxt>

  // 3. DNS query result - Log raw result structure
  console.log('[getDnsImportData] DNS query result:', {
    hasAnswer: !!result.answer,
    proofsCount: result.proofs?.length || 0,
    answerType: result.answer?.signature?.data?.typeCovered,
  })

  const allProofs = (
    result.proofs as SignedSet<packet.Ds | packet.Dnskey | packet.Rtxt>[]
  ).concat([result.answer])

  // 4. Proofs assembly - Log combined proofs
  console.log('[getDnsImportData] Assembled proofs:', {
    totalProofs: allProofs.length,
    proofTypes: allProofs.map((p) => p.signature?.data?.typeCovered || 'unknown'),
  })

  const rrsets = encodeProofs(allProofs)

  // 5. Encoded rrsets - Log hex-encoded data
  console.log('[getDnsImportData] Encoded rrsets:', {
    count: rrsets.length,
    rrsets: rrsets.map((r, i) => ({
      index: i,
      rrsetLength: r.rrset.length,
      sigLength: r.sig.length,
      rrsetPreview: r.rrset.slice(0, 20) + '...',
      sigPreview: r.sig.slice(0, 20) + '...',
    })),
  })

  // 6. On-chain verification - Log inputs
  const dnssecImplAddress = getChainContractAddress({
    client,
    contract: 'ensDnssecImpl',
  })
  console.log('[getDnsImportData] Calling verifyRRSet:', {
    contract: dnssecImplAddress,
    rrsetsCount: rrsets.length,
  })

  const [onchainRrData, inception] = await readContract(client, {
    abi: dnssecImplVerifyRrSetSnippet,
    address: dnssecImplAddress,
    functionName: 'verifyRRSet',
    args: [rrsets],
  })

  // 6. On-chain verification - Log outputs
  console.log('[getDnsImportData] verifyRRSet result:', {
    onchainRrDataLength: onchainRrData.length,
    inception: inception.toString(),
    onchainRrDataPreview: onchainRrData.slice(0, 20) + '...',
  })

  const lastProof = allProofs[allProofs.length - 1]

  // 7. Serial number comparison
  console.log('[getDnsImportData] Serial number comparison:', {
    onchainInception: inception.toString(),
    dnsInception: lastProof.signature.data.inception.toString(),
    isNewer: serialNumberGt(inception, lastProof.signature.data.inception),
  })

  if (serialNumberGt(inception, lastProof.signature.data.inception))
    throw new DnsNewerRecordTypeAvailableError({
      typeCovered: lastProof.signature.data.typeCovered,
      signatureName: lastProof.signature.name,
      onchainInception: inception,
      dnsInception: lastProof.signature.data.inception,
    })

  // 8. Final validation - Log comparison
  const lastProofWire = toHex(lastProof.toWire(false))
  console.log('[getDnsImportData] Final validation:', {
    lastProofWireLength: lastProofWire.length,
    onchainRrDataLength: onchainRrData.length,
    match: lastProofWire === onchainRrData,
    lastProofWirePreview: lastProofWire.slice(0, 20) + '...',
    onchainRrDataPreview: onchainRrData.slice(0, 20) + '...',
  })

  if (lastProofWire !== onchainRrData)
    throw new Error('Mismatched proof data')

  // 9. Return value
  console.log('[getDnsImportData] Returning rrsets:', { count: rrsets.length })

  return rrsets
}

export default getDnsImportData
