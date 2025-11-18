import {
  type Address,
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
  type Hex,
  type Keccak256ErrorType,
  keccak256,
  type PadErrorType,
  pad,
  padHex,
  type ToBytesErrorType,
  type ToHexErrorType,
  toBytes,
  toHex,
  zeroAddress,
} from 'viem'
import { type NamehashErrorType, namehash } from 'viem/ens'
import {
  CampaignReferenceTooLargeError,
  type ErrorType,
} from '../errors/utils.js'

export type L2RegistrationParameters = {
  /** Name's label (the thing before .eth) to register */
  label: string
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
  /** Referrer address. Optional */
  referrer?: Hex
  /** Payment token. USDC is used by default */
  paymentToken?: Address
}

export type L2CommitmentTuple = [
  label: string,
  owner: Address,
  secret: Hex,
  subregistry: Address,
  resolver: Address,
  duration: bigint,
  referrer: Hex,
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
  const bytes = cryptoRef?.getRandomValues(new Uint8Array(32))!
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
  label,
  owner,
  duration,
  secret,
  subregistryAddress = zeroAddress,
  resolverAddress = zeroAddress,
  referrer,
}: L2RegistrationParameters): L2CommitmentTuple => {
  return [
    label,
    owner,
    secret,
    subregistryAddress,
    resolverAddress,
    BigInt(duration),
    referrer || padHex('0x', { size: 32 }),
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
        { name: 'label', type: 'string' },
        { name: 'owner', type: 'address' },
        { name: 'secret', type: 'bytes32' },
        { name: 'subregistry', type: 'address' },
        { name: 'resolver', type: 'address' },
        { name: 'duration', type: 'uint64' },
        { name: 'referrer', type: 'bytes32' },
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
