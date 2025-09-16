import { evmChainIdToCoinType } from '@ensdomains/address-encoder/utils'
import {
  type Address,
  type Hex,
  encodeAbiParameters,
  keccak256,
  pad,
  toBytes,
  toHex,
  zeroHash,
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
  reverseRecord?: ('ethereum' | 'default')[]
  /** Referrer value to use for registration */
  referrer?: Hex
}

export type PreparedRegistrationParameters = {
  label: string
  owner: Address
  duration: bigint
  secret: Hex
  resolver: Address
  data: Hex[]
  reverseRecord: number
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

const reverseRecordBitmask = {
  ethereum: 1,
  default: 2,
}

export const registrationParametersWithDefaults = ({
  name,
  owner,
  duration,
  resolverAddress = EMPTY_ADDRESS,
  records: { coins = [], ...records } = { texts: [], coins: [] },
  reverseRecord = [],
  secret,
  referrer = zeroHash,
}: RegistrationParameters): PreparedRegistrationParameters => {
  const hash = namehash(name)

  if (reverseRecord.includes('default') && !coins.length)
    coins.push({ coin: evmChainIdToCoinType(0), value: owner })
  else if (
    reverseRecord.includes('ethereum') &&
    !coins.find(
      (c) =>
        (typeof c.coin === 'string' && c.coin.toLowerCase() === 'eth') ||
        (typeof c.coin === 'string'
          ? Number.parseInt(c.coin) === 60
          : c.coin === 60),
    )
  )
    coins.push({ coin: 60, value: owner })

  const data = records
    ? generateRecordCallArray({ namehash: hash, coins, ...records })
    : []

  // this will throw if reverseRecord is going to be set as well
  if (data.length > 0 && resolverAddress === EMPTY_ADDRESS)
    throw new ResolverAddressRequiredError({
      data: {
        name,
        owner,
        duration,
        resolverAddress,
        records,
        reverseRecord,
        referrer,
      },
    })

  return {
    label: name.split('.')[0],
    owner,
    duration: BigInt(duration),
    secret,
    resolver: resolverAddress,
    data,
    reverseRecord: reverseRecord.reduce(
      (acc, curr) => acc | reverseRecordBitmask[curr],
      0,
    ),
    referrer,
  }
}

export const createCommitmentHash = (
  params: PreparedRegistrationParameters,
): Hex => {
  return keccak256(
    encodeAbiParameters(
      [
        {
          components: [
            {
              name: 'label',
              type: 'string',
            },
            {
              name: 'owner',
              type: 'address',
            },
            {
              name: 'duration',
              type: 'uint256',
            },
            {
              name: 'secret',
              type: 'bytes32',
            },
            {
              name: 'resolver',
              type: 'address',
            },
            {
              name: 'data',
              type: 'bytes[]',
            },
            {
              name: 'reverseRecord',
              type: 'uint8',
            },
            {
              name: 'referrer',
              type: 'bytes32',
            },
          ],
          name: 'registration',
          type: 'tuple',
        },
      ],
      [params],
    ),
  )
}

export const createCommitmentHashWithDefaults = (
  params: RegistrationParameters,
): Hex => createCommitmentHash(registrationParametersWithDefaults(params))
