import {
  type Address,
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
  type Hex,
  type Keccak256ErrorType,
  keccak256,
  type LabelhashErrorType,
  labelhash,
  type PadErrorType,
  pad,
  type ToBytesErrorType,
  type ToHexErrorType,
  toBytes,
  toHex,
  zeroAddress,
} from 'viem'
import {
  CampaignReferenceTooLargeError,
  type ErrorType,
  ResolverAddressRequiredError,
} from '../errors/utils.js'
import {
  // TODO: missing function @tate
  // @ts-expect-error missing function
  generateRecordCallArray,
  type RecordOptions,
} from './coders/resolverMulticallParameters.js'
import {
  type EncodeChildFusesInputObject,
  type EncodeFusesErrorType,
  encodeFuses,
} from './fuses.js'
import { type NamehashErrorType, namehash } from './name/namehash.js'

export type RegistrationParameters = {
  /** Name to register */
  name: string
  /** Address to set owner to */
  owner: Address
  /** Duration of registration */
  duration: number
  /** Random 32 bytes to use for registration */
  secret: Hex
  /** Custom resolver address, defaults to current public resolver deployment */
  resolverAddress?: Address
  /** Records to set upon registration */
  records?: RecordOptions
  /** Sets primary name upon registration */
  reverseRecord?: boolean
  /** Fuses to set upon registration */
  fuses?: EncodeChildFusesInputObject
}

export type CommitmentTuple = [
  labelHash: Hex,
  owner: Address,
  duration: bigint,
  secret: Hex,
  resolver: Address,
  data: Hex[],
  reverseRecord: boolean,
  ownerControlledFuses: number,
]

export type RegistrationTuple = [
  label: string,
  owner: Address,
  duration: bigint,
  secret: Hex,
  resolver: Address,
  data: Hex[],
  reverseRecord: boolean,
  ownerControlledFuses: number,
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
// Make commitment tuple
// ================================

export type MakeCommitmentTupleErrorType =
  | LabelhashErrorType
  | NamehashErrorType
  | EncodeFusesErrorType
  | ResolverAddressRequiredError

export const makeCommitmentTuple = ({
  name,
  owner,
  duration,
  resolverAddress = zeroAddress,
  records: { coins = [], ...records } = { texts: [], coins: [] },
  reverseRecord,
  fuses,
  secret,
}: RegistrationParameters): CommitmentTuple => {
  const labelHash = labelhash(name.split('.')[0])
  const hash = namehash(name)
  const fuseData = fuses
    ? encodeFuses({ restriction: 'child', input: fuses })
    : 0

  if (
    reverseRecord &&
    !coins.find(
      (c) =>
        (typeof c.coin === 'string' && c.coin.toLowerCase() === 'eth') ||
        (typeof c.coin === 'string'
          ? Number.parseInt(c.coin) === 60
          : c.coin === 60),
    )
  ) {
    coins.push({ coin: 60, value: owner })
  }

  const data = records
    ? generateRecordCallArray({ namehash: hash, coins, ...records })
    : []

  if (data.length > 0 && resolverAddress === zeroAddress)
    throw new ResolverAddressRequiredError({
      data: {
        name,
        owner,
        duration,
        resolverAddress,
        records,
        reverseRecord,
        fuses,
      },
    })

  return [
    labelHash,
    owner,
    BigInt(duration),
    secret,
    resolverAddress,
    data,
    !!reverseRecord,
    fuseData,
  ]
}

// ================================
// Make registration tuple
// ================================

export type MakeRegistrationTupleErrorType = MakeCommitmentTupleErrorType

export const makeRegistrationTuple = (
  params: RegistrationParameters,
): RegistrationTuple => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_labelhash, ...commitmentData] = makeCommitmentTuple(params)
  const label = params.name.split('.')[0]
  return [label, ...commitmentData]
}

// ================================
// Make commitment from tuple
// ================================

export type MakeCommitmentFromTupleErrorType =
  | Keccak256ErrorType
  | EncodeAbiParametersErrorType

export const makeCommitmentFromTuple = (params: CommitmentTuple): Hex => {
  return keccak256(
    encodeAbiParameters(
      [
        { name: 'name', type: 'bytes32' },
        { name: 'owner', type: 'address' },
        { name: 'duration', type: 'uint256' },
        { name: 'secret', type: 'bytes32' },
        { name: 'resolver', type: 'address' },
        { name: 'data', type: 'bytes[]' },
        { name: 'reverseRecord', type: 'bool' },
        { name: 'ownerControlledFuses', type: 'uint16' },
      ],
      params,
    ),
  )
}

// ================================
// Make commitment
// ================================

export type MakeCommitmentErrorType =
  | MakeCommitmentTupleErrorType
  | MakeCommitmentFromTupleErrorType

export const makeCommitment = (params: RegistrationParameters): Hex =>
  makeCommitmentFromTuple(makeCommitmentTuple(params))
