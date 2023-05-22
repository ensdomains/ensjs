import { DNSProver, ProvableAnswer, SignedSet } from '@ensdomains/dnsprovejs'
import type * as packet from 'dns-packet'
import { toType } from 'dns-packet/types'
import { keccak256, toBytes, toHex } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { anchorsSnippet, rrDataSnippet } from '../../contracts/dnssecImpl'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { packetToBytes } from '../../utils/hexEncodedName'
import { Endpoint } from './types'

export type PrepareDnsImportParameters = {
  name: string
  endpoint?: Endpoint
}

export type RrSetWithSig = {
  rrset: Uint8Array
  sig: Uint8Array
}

export type PrepareDnsImportReturnType = {
  rrsets: RrSetWithSig[]
  proof: Uint8Array
}

// Compares two serial numbers using RFC1982 serial number math.
const serialNumberGt = (i1: number, i2: number): boolean =>
  (i1 < i2 && i2 - i1 > 0x7fffffff) || (i1 > i2 && i1 - i2 < 0x7fffffff)

const encodeProofs = (
  proofs: SignedSet<packet.Ds | packet.Dnskey | packet.Rtxt>[],
): RrSetWithSig[] =>
  proofs.map((proof) => ({
    rrset: proof.toWire(true),
    sig: proof.signature.data.signature,
  }))

const prepareDnsImport = async (
  client: ClientWithEns,
  {
    name,
    endpoint = 'https://cloudflare-dns.com/dns-query',
  }: PrepareDnsImportParameters,
): Promise<PrepareDnsImportReturnType> => {
  const prover = DNSProver.create(endpoint)
  const result = (await prover.queryWithProof(
    'TXT',
    `_ens.${name}`,
  )) as ProvableAnswer<packet.Rtxt>

  const allProofs = (
    result.proofs as SignedSet<packet.Ds | packet.Dnskey | packet.Rtxt>[]
  ).concat([result.answer])

  const ensDnssecImplAddress = getChainContractAddress({
    client,
    contract: 'ensDnssecImpl',
  })

  for (let i = allProofs.length - 1; i >= 0; i -= 1) {
    const proof = allProofs[i]
    const hexEncodedName = toHex(packetToBytes(proof.signature.name))
    const type = toType(proof.signature.data.typeCovered)
    // eslint-disable-next-line no-await-in-loop
    const [inception, expiration, hash] = await client.readContract({
      abi: rrDataSnippet,
      address: ensDnssecImplAddress,
      functionName: 'rrdata',
      args: [type, hexEncodedName],
    })
    if (serialNumberGt(inception, proof.signature.data.inception)) {
      throw new Error(
        `DNSSEC Oracle has a newer version of the ${proof.signature.data.typeCovered} RRSET on ${proof.signature.name}`,
      )
    }
    const expired = serialNumberGt(Date.now() / 1000, expiration)
    const proofHash = keccak256(proof.toWire(false)).slice(0, 42)
    const isKnownProof = hash === proofHash && !expired
    if (isKnownProof) {
      if (i === allProofs.length - 1) {
        return { rrsets: [], proof: proof.toWire(false) }
      }
      return {
        rrsets: encodeProofs(allProofs.slice(i + 1, allProofs.length)),
        proof: proof.toWire(false),
      }
    }
  }

  return {
    rrsets: encodeProofs(allProofs),
    proof: toBytes(
      await client.readContract({
        abi: anchorsSnippet,
        address: ensDnssecImplAddress,
        functionName: 'anchors',
      }),
    ),
  }
}

export default prepareDnsImport
