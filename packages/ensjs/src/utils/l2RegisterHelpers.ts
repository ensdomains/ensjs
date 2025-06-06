import {
  type Address,
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
  type Hex,
  type Keccak256ErrorType,
  keccak256,
  type PadErrorType,
  type ToBytesErrorType,
  type ToHexErrorType,
  toBytes,
  toHex,
  pad,
  zeroAddress,
} from 'viem'
import {
  CampaignReferenceTooLargeError,
  type ErrorType,
} from '../errors/utils.js'
import { type NamehashErrorType, namehash } from './name/namehash.js'

export type L2RegistrationParameters = {
  /** Name to register */
  name: string
  /** Address to set owner to */
  owner: Address
  /** Duration of registration */
  duration: number
  /** Random 32 bytes to use for registration */
  secret: Hex
  /** Subregistry address to use for registration */
  subregistryAddress?: Address
  /** Custom resolver address, defaults to current public resolver deployment */
  resolverAddress?: Address
}

export type L2CommitmentTuple = [
  name: string,
  owner: Address,
  secret: Hex,
  subregistry: Address,
  resolver: Address,
  duration: bigint,
]

const cryptoRef =
  (typeof crypto !== 'undefined' && crypto) ||
  (typeof window !== 'undefined' &&
    typeof window.crypto !== 'undefined' &&
    window.crypto) ||
  undefined

// ================================
// Random secret
// ================================

export type RandomSecretErrorType =
  | ToBytesErrorType
  | NamehashErrorType
  | CampaignReferenceTooLargeError
  | PadErrorType
  | ToHexErrorType
  | ErrorType

export const randomSecret = ({
  platformDomain,
  campaign,
}: {
  platformDomain?: string
  campaign?: number
} = {}) => {
  const bytes = cryptoRef!.getRandomValues(new Uint8Array(32))
  if (platformDomain) {
    const hash = toBytes(namehash(platformDomain))
    for (let i = 0; i < 4; i += 1) {
      bytes[i] = hash[i]
    }
  }
  if (campaign) {
    if (campaign > 0xffffffff)
      throw new CampaignReferenceTooLargeError({ campaign })
    const campaignBytes = pad(toBytes(campaign), { size: 4 })
    for (let i = 0; i < 4; i += 1) {
      bytes[i + 4] = campaignBytes[i]
    }
  }
  return toHex(bytes)
}

// ================================
// Make L2 commitment tuple
// ================================

export type MakeL2CommitmentTupleErrorType = ErrorType

export const makeL2CommitmentTuple = ({
  name,
  owner,
  duration,
  secret,
  subregistryAddress = zeroAddress,
  resolverAddress = zeroAddress,
}: L2RegistrationParameters): L2CommitmentTuple => {
  return [
    name,
    owner,
    secret,
    subregistryAddress,
    resolverAddress,
    BigInt(duration),
  ]
}

// ================================
// Make L2 commitment from tuple
// ================================

export type MakeL2CommitmentFromTupleErrorType =
  | Keccak256ErrorType
  | EncodeAbiParametersErrorType

export const makeL2CommitmentFromTuple = (params: L2CommitmentTuple): Hex => {
  return keccak256(
    encodeAbiParameters(
      [
        { name: 'name', type: 'string' },
        { name: 'owner', type: 'address' },
        { name: 'secret', type: 'bytes32' },
        { name: 'subregistry', type: 'address' },
        { name: 'resolver', type: 'address' },
        { name: 'duration', type: 'uint64' },
      ],
      params,
    ),
  )
}

// ================================
// Make L2 commitment
// ================================

export type MakeL2CommitmentErrorType =
  | MakeL2CommitmentTupleErrorType
  | MakeL2CommitmentFromTupleErrorType

export const makeL2Commitment = (params: L2RegistrationParameters): Hex =>
  makeL2CommitmentFromTuple(makeL2CommitmentTuple(params)) 