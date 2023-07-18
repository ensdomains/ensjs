import {
  decode,
  encode,
  getCodec,
  type Codec as InternalCodec,
} from '@ensdomains/content-hash'
import { isHex, type Hex } from 'viem'
import { InvalidContentHashError } from '../errors/utils.js'

export type ProtocolType =
  | 'ipfs'
  | 'ipns'
  | 'bzz'
  | 'onion'
  | 'onion3'
  | 'sia'
  | 'ar'
  | null

export type DecodedContentHash = {
  protocolType: ProtocolType
  decoded: string
}

function matchProtocol(text: string) {
  return (
    text.match(/^(ipfs|sia|ipns|bzz|onion|onion3|arweave|ar):\/\/(.*)/) ||
    text.match(/\/(ipfs)\/(.*)/) ||
    text.match(/\/(ipns)\/(.*)/)
  )
}

const getDisplayCodec = (encoded: string): ProtocolType => {
  const codec = getCodec(encoded)
  switch (codec) {
    case 'ipfs':
    case 'ipns':
    case 'onion':
    case 'onion3':
      return codec
    case 'swarm':
      return 'bzz'
    case 'skynet':
      return 'sia'
    case 'arweave':
      return 'ar'
    default:
      return null
  }
}

const getInternalCodec = (
  displayCodec: NonNullable<ProtocolType>,
): InternalCodec => {
  switch (displayCodec) {
    case 'bzz':
      return 'swarm'
    case 'sia':
      return 'skynet'
    case 'ar':
      return 'arweave'
    default:
      return displayCodec
  }
}

export function decodeContentHash(encoded: Hex): DecodedContentHash | null {
  if (!encoded || encoded === '0x') {
    return null
  }
  const decoded = decode(encoded)
  const protocolType = getDisplayCodec(encoded)
  return { protocolType, decoded }
}

export function isValidContentHash(encoded: unknown) {
  if (typeof encoded !== 'string') return false
  const codec = getCodec(encoded)
  return Boolean(codec && isHex(encoded))
}

export function getProtocolType(encoded: string) {
  const matched = matchProtocol(encoded)
  if (!matched) return null
  const [, protocolType, decoded] = matched
  return { protocolType: protocolType as NonNullable<ProtocolType>, decoded }
}

export function encodeContentHash(text: string): Hex {
  const typeData = getProtocolType(text)
  if (!typeData) throw new InvalidContentHashError()

  const internalCodec = getInternalCodec(typeData.protocolType)

  return `0x${encode(internalCodec, typeData.decoded)}`
}
