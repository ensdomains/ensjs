import {
  permissionedResolverSetAbiSnippet,
  permissionedResolverSetAddressSnippet,
  permissionedResolverSetContenthashSnippet,
  permissionedResolverSetTextSnippet,
} from '@ensdomains/ensjs-abi/v2/permissionedResolver'
import {
  type BytesToHexErrorType,
  bytesToHex,
  type EncodeFunctionDataParameters,
  type Hex,
  toHex,
} from 'viem'
import { packetToBytes } from 'viem/ens'
import type { ErrorType } from '../../../errors/utils.js'
import type { Prettify } from '../../../types/index.js'
import {
  type EncodeContentHashErrorType,
  encodeContentHash,
} from '../../contentHash.js'
import {
  type GetCoderFromCoinErrorType,
  getCoderFromCoin,
} from '../../normalizeCoinId.js'
import {
  type AbiEncodeAs,
  type EncodeAbiErrorType,
  type EncodeAbiParameters,
  encodeAbi,
} from '../../resolver/encodeAbi.js'

/**
 * Record setter parameters for the post-audit-2 `PermissionedResolver`. Unlike
 * the v1 builders in `utils/resolver`, these address records by DNS-encoded
 * name (`setAddress(name, ...)`) rather than by `bytes32` node.
 */

/** DNS-encode a dotted name the way the resolver setters expect it. */
export const dnsEncodeName = (name: string): Hex => toHex(packetToBytes(name))

// ─── setAddress ──────────────────────────────────────────────────────

export type SetAddressParametersParameters = {
  /** Name to set the address record for (DNS-encoded internally) */
  name: string
  coin: string | number
  value: string | null
}

export type SetAddressParametersErrorType =
  | GetCoderFromCoinErrorType
  | BytesToHexErrorType
  | ErrorType

export const setAddressParameters = ({
  name,
  coin,
  value,
}: SetAddressParametersParameters) => {
  const coder = getCoderFromCoin(coin)
  let encodedAddress: Hex | Uint8Array = value ? coder.decode(value) : '0x'
  if (typeof encodedAddress !== 'string') {
    encodedAddress = bytesToHex(encodedAddress)
  }

  return {
    abi: permissionedResolverSetAddressSnippet,
    functionName: 'setAddress',
    args: [dnsEncodeName(name), BigInt(coder.coinType), encodedAddress],
  } as const satisfies EncodeFunctionDataParameters<
    typeof permissionedResolverSetAddressSnippet
  >
}

export type SetAddressParametersReturnType = ReturnType<
  typeof setAddressParameters
>

// ─── setText ─────────────────────────────────────────────────────────

export type SetTextParametersParameters = {
  /** Name to set the text record for (DNS-encoded internally) */
  name: string
  key: string
  value: string | null
}

export const setTextParameters = ({
  name,
  key,
  value,
}: SetTextParametersParameters) => {
  return {
    abi: permissionedResolverSetTextSnippet,
    functionName: 'setText',
    args: [dnsEncodeName(name), key, value ?? ''],
  } as const satisfies EncodeFunctionDataParameters<
    typeof permissionedResolverSetTextSnippet
  >
}

export type SetTextParametersReturnType = ReturnType<typeof setTextParameters>

// ─── setContenthash ──────────────────────────────────────────────────

export type SetContenthashParametersParameters = {
  /** Name to set the contenthash for (DNS-encoded internally) */
  name: string
  contentHash: string | null
}

export type SetContenthashParametersErrorType = EncodeContentHashErrorType

export const setContenthashParameters = ({
  name,
  contentHash,
}: SetContenthashParametersParameters) => {
  const encodedHash = contentHash ? encodeContentHash(contentHash) : '0x'
  return {
    abi: permissionedResolverSetContenthashSnippet,
    functionName: 'setContenthash',
    args: [dnsEncodeName(name), encodedHash],
  } as const satisfies EncodeFunctionDataParameters<
    typeof permissionedResolverSetContenthashSnippet
  >
}

export type SetContenthashParametersReturnType = ReturnType<
  typeof setContenthashParameters
>

// ─── setABI ──────────────────────────────────────────────────────────

export type SetAbiParametersParameters<
  encodeAs extends AbiEncodeAs = AbiEncodeAs,
> = Prettify<
  {
    /** Name to set the ABI for (DNS-encoded internally) */
    name: string
  } & EncodeAbiParameters<encodeAs>
>

export type SetAbiParametersErrorType = EncodeAbiErrorType

export const setAbiParameters = async <encodeAs extends AbiEncodeAs>({
  name,
  data,
  encodeAs,
}: SetAbiParametersParameters<encodeAs>) => {
  const { contentType, encodedData } = await encodeAbi({
    data,
    encodeAs,
  } as EncodeAbiParameters<encodeAs>)

  return {
    abi: permissionedResolverSetAbiSnippet,
    functionName: 'setABI',
    args: [dnsEncodeName(name), BigInt(contentType), encodedData],
  } as const satisfies EncodeFunctionDataParameters<
    typeof permissionedResolverSetAbiSnippet
  >
}

export type SetAbiParametersReturnType = Awaited<
  ReturnType<typeof setAbiParameters>
>

// ─── multicall ───────────────────────────────────────────────────────

export type RecordOptions = Prettify<{
  /** ContentHash value; `null` clears it */
  contentHash?: string | null
  /** Text records; a `null` value clears the key */
  texts?: Omit<SetTextParametersParameters, 'name'>[]
  /** Address records; a `null` value clears the coin */
  coins?: Omit<SetAddressParametersParameters, 'name'>[]
  /** ABI value */
  abi?: EncodeAbiParameters | EncodeAbiParameters[]
}>

export type ResolverMulticallItem =
  | SetContenthashParametersReturnType
  | SetAbiParametersReturnType
  | SetTextParametersReturnType
  | SetAddressParametersReturnType

export type ResolverMulticallParametersReturnType = ResolverMulticallItem[]

export type ResolverMulticallParametersErrorType =
  | SetContenthashParametersErrorType
  | SetAbiParametersErrorType
  | SetAddressParametersErrorType

/**
 * Build the individual setter calls for a set of record changes. There is no
 * "clear all" on this resolver: to start a name from scratch, unlink it with
 * `linkToRecord(name, 0)` instead.
 */
export const resolverMulticallParameters = async ({
  name,
  contentHash,
  texts,
  coins,
  abi,
}: {
  name: string
} & RecordOptions): Promise<ResolverMulticallParametersReturnType> => {
  const calls: ResolverMulticallParametersReturnType = []

  if (contentHash !== undefined) {
    calls.push(setContenthashParameters({ name, contentHash }))
  }

  if (abi !== undefined) {
    const abis = Array.isArray(abi) ? abi : [abi]
    calls.push(
      ...(await Promise.all(
        abis.map((abiItem) => setAbiParameters({ name, ...abiItem })),
      )),
    )
  }

  if (texts && texts.length > 0) {
    calls.push(
      ...texts.map((textItem) => setTextParameters({ name, ...textItem })),
    )
  }

  if (coins && coins.length > 0) {
    calls.push(
      ...coins.map((coinItem) => setAddressParameters({ name, ...coinItem })),
    )
  }

  return calls
}
