import {
  keccak256,
  labelhash,
  type Address,
  type Hex,
  encodePacked,
} from 'viem'
import { EMPTY_ADDRESS } from './consts.js'
import { LegacyRegistrationInvalidConfigError } from '../errors/register.js'

export type LegacyRegistrationBaseParameters = {
  /** Name to register */
  name: string
  /** Address to set owner to */
  owner: Address
  /** Duration of registration */
  duration: number
  /** Random 32 bytes to use for registration */
  secret: Hex
}

export type LegacyRegistrationWithConfigParameters =
  LegacyRegistrationBaseParameters & {
    /** Custom resolver address, defaults to empty address */
    resolverAddress: Address
    /** Address to set upon registration, defaults to empty address */
    address?: Address
  }

export type LegacyRegistrationParameters =
  | LegacyRegistrationBaseParameters
  | LegacyRegistrationWithConfigParameters

export const isLegacyRegistrationWithConfig = (
  params: LegacyRegistrationParameters,
): params is LegacyRegistrationWithConfigParameters => {
  const { resolverAddress = EMPTY_ADDRESS, address = EMPTY_ADDRESS } =
    params as LegacyRegistrationWithConfigParameters
  return resolverAddress !== EMPTY_ADDRESS || address !== EMPTY_ADDRESS
}

export type LegacyCommitmentTuple =
  | [label: string, owner: Address, secret: Hex]
  | [
      label: string,
      owner: Address,
      resolverAddress: Address,
      address: Address,
      secret: Hex,
    ]

export type LegacyRegistrationTuple =
  | [label: string, owner: Address, duration: bigint, secret: Hex]
  | [
      label: string,
      owner: Address,
      duration: bigint,
      secret: Hex,
      resolverAddress: Address,
      address: Address,
    ]

export const normalizeLegacyRegistrationParameters = (
  params: LegacyRegistrationParameters,
): LegacyRegistrationParameters => {
  const {
    resolverAddress = EMPTY_ADDRESS,
    address = EMPTY_ADDRESS,
    ...base
  } = params as LegacyRegistrationWithConfigParameters

  if (!isLegacyRegistrationWithConfig(params)) return base

  if (resolverAddress === EMPTY_ADDRESS && address !== EMPTY_ADDRESS)
    throw new LegacyRegistrationInvalidConfigError({
      resolverAddress,
      address,
    })

  return { ...base, resolverAddress, address }
}

export const makeLegacyCommitmentTuple = (
  params: LegacyRegistrationParameters,
): LegacyCommitmentTuple => {
  const { name, owner, secret, resolverAddress, address } =
    params as LegacyRegistrationWithConfigParameters

  const label = name.split('.')[0]

  if (resolverAddress || address) {
    return [label, owner, secret, resolverAddress, address ?? EMPTY_ADDRESS]
  }
  return [label, owner, secret]
}

export const makeLegacyRegistrationTuple = (
  params: LegacyRegistrationParameters,
): LegacyRegistrationTuple => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, owner, secret, ...rest] = makeLegacyCommitmentTuple(params)
  const label = params.name.split('.')[0]
  if (rest.length)
    return [label, owner, BigInt(params.duration), secret, ...rest]
  return [label, owner, BigInt(params.duration), secret]
}

export const makeLegacyCommitmentFromTuple = ([
  label,
  ...others
]: LegacyCommitmentTuple): Hex => {
  const labelHash = labelhash(label)
  const params = [labelHash, ...others] as const
  if (params.length === 3)
    return keccak256(encodePacked(['bytes32', 'address', 'bytes32'], params))

  const [owner, secret, resolverAddress, address] = others
  return keccak256(
    encodePacked(
      ['bytes32', 'address', 'address', 'address', 'bytes32'],
      [labelHash, owner, resolverAddress, address, secret],
    ),
  )
}

export const makeLegacyCommitment = (
  params: LegacyRegistrationParameters,
): Hex =>
  makeLegacyCommitmentFromTuple(
    makeLegacyCommitmentTuple(normalizeLegacyRegistrationParameters(params)),
  )
