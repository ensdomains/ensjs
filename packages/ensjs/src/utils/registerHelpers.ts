import {
  type Address,
  type Hex,
  encodeAbiParameters,
  keccak256,
  pad,
  parseAbiParameters,
  toBytes,
  toHex,
} from 'viem'
import {
  CampaignReferenceTooLargeError,
  ResolverAddressRequiredError,
} from '../errors/utils.js'
import { EMPTY_ADDRESS } from './consts.js'
import {
  type RecordOptions,
  generateRecordCallArray,
} from './generateRecordCallArray.js'
import { namehash } from './normalise.js'

export enum ReverseRecordParameter {
  None = 0,
  Ethereum = 1,
  Default = 2,
}

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
  reverseRecord?: ReverseRecordParameter
  /** Referrer for registration */
  referrer?: Hex
}

export type RegistrationCallData = {
  label: string
  owner: Address
  duration: bigint
  secret: Hex
  resolver: Address
  data: Hex[]
  reverseRecord: ReverseRecordParameter
  referrer: Hex
}

const cryptoRef =
  (typeof crypto !== 'undefined' && crypto) ||
  (typeof window !== 'undefined' &&
    typeof window.crypto !== 'undefined' &&
    window.crypto) ||
  undefined

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

export const makeRegistrationCallData = ({
  name,
  owner,
  duration,
  resolverAddress = EMPTY_ADDRESS,
  records: { coins = [], ...records } = { coins: [], texts: [] },
  reverseRecord,
  secret,
  referrer = '0x0000000000000000000000000000000000000000000000000000000000000000',
}: RegistrationParameters): RegistrationCallData => {
  const label = name.split('.')[0]
  const hash = namehash(name)

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

  if (data.length > 0 && resolverAddress === EMPTY_ADDRESS)
    throw new ResolverAddressRequiredError({
      data: {
        name,
        owner,
        duration,
        resolverAddress,
        records,
        reverseRecord,
      },
    })

  return {
    label,
    owner,
    duration: BigInt(duration),
    secret,
    resolver: resolverAddress,
    data,
    reverseRecord: reverseRecord ?? 0,
    referrer: referrer,
  }
}

export const makeCommitmentFromCallData = (
  callData: RegistrationCallData,
): Hex => {
  return keccak256(
    encodeAbiParameters(
      parseAbiParameters(
        '(string label,address owner,uint256 duration,bytes32 secret,address resolver,bytes[] data,uint8 reverseRecord,bytes32 referrer)',
      ),
      [callData],
    ),
  )
}

export const makeCommitment = (params: RegistrationParameters): Hex =>
  makeCommitmentFromCallData(makeRegistrationCallData(params))
