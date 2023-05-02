import { Address, Hex, encodeAbiParameters, keccak256, labelhash } from 'viem'
import { EMPTY_ADDRESS } from './consts'
import { CombinedFuseInput, encodeFuses, hasFuses } from './fuses'
import { namehash } from './normalise'
import { RecordOptions, generateRecordCallArray } from './recordHelpers'

export type RegistrationParameters = {
  name: string
  owner: Address
  duration: number
  secret: Hex
  resolverAddress?: Address
  records?: RecordOptions
  reverseRecord?: boolean
  fuses?: CombinedFuseInput['child']
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

export const randomSecret = () => {
  const bytes = Buffer.allocUnsafe(32)
  return `0x${crypto.getRandomValues(bytes).toString('hex')}`
}

export const makeCommitmentTuple = ({
  name,
  owner,
  duration,
  resolverAddress = EMPTY_ADDRESS,
  records: { coins = [], ...records } = { texts: [], coins: [] },
  reverseRecord,
  fuses,
  secret,
}: RegistrationParameters): CommitmentTuple => {
  const labelHash = labelhash(name.split('.')[0])
  const hash = namehash(name)
  const fuseData = hasFuses(fuses) ? encodeFuses(fuses!, 'child') : 0

  if (
    reverseRecord &&
    !coins.find(
      (c) =>
        c.coin === 'ETH' ||
        (typeof c.coin === 'string' ? parseInt(c.coin) === 60 : c.coin === 60),
    )
  ) {
    coins.push({ coin: 60, address: owner })
  }

  const data = records
    ? generateRecordCallArray({ namehash: hash, coins, ...records })
    : []

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

export const makeRegistrationTuple = (
  params: RegistrationParameters,
): RegistrationTuple => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_labelhash, ...commitmentData] = makeCommitmentTuple(params)
  const label = params.name.split('.')[0]
  return [label, ...commitmentData]
}

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

export const makeCommitment = (params: RegistrationParameters): Hex =>
  makeCommitmentFromTuple(makeCommitmentTuple(params))
