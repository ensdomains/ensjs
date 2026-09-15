import {
  permissionedResolverSetAbiSnippet,
  permissionedResolverSetAddressSnippet,
  permissionedResolverSetContenthashSnippet,
  permissionedResolverSetTextSnippet,
} from '@ensdomains/ensjs-abi/v2/permissionedResolver'
import {
  type Address,
  bytesToHex,
  type EncodeFunctionDataParameters,
  type Hex,
  toHex,
} from 'viem'
import { packetToBytes } from 'viem/ens'
import type { Prettify } from '../../../types/index.js'
import { encodeContentHash } from '../../contentHash.js'
import { getCoderFromCoin } from '../../normalizeCoinId.js'
import {
  type AbiEncodeAs,
  type EncodeAbiParameters,
  encodeAbi,
} from '../../resolver/encodeAbi.js'

/**
 * V2 `PermissionedResolver` record setters.
 *
 * These mirror the v1 `PublicResolver` helpers in `utils/resolver/`, and reuse
 * their value encoders verbatim — only the *addressing* differs. Every V2
 * setter takes the DNS-encoded name (`bytes`), not `bytes32 node`, so a
 * namehash here hits the fallback and reverts with empty data. `setAddr` is
 * also renamed `setAddress`; the rest keep their names but still change
 * selector because of that first argument.
 *
 * See contracts-v2 `src/resolver/PermissionedResolver.sol`.
 */
/** DNS-encode a dotted name, the form every V2 resolver call takes. */
export const dnsEncodeName = (name: string): Hex => toHex(packetToBytes(name))

export type SetAddressParametersParameters = {
  /** Name to set the address record for (DNS-encoded internally) */
  name: string
  coin: string | number
  value: Address | string | null
}

export const setAddressParameters = ({
  name,
  coin,
  value,
}: SetAddressParametersParameters) => {
  const coder = getCoderFromCoin(coin)
  const inputCoinType = coder.coinType
  let encodedAddress: Hex | Uint8Array = value ? coder.decode(value) : '0x'

  if (inputCoinType === 60 && encodedAddress === '0x')
    encodedAddress = coder.decode('0x0000000000000000000000000000000000000000')
  if (typeof encodedAddress !== 'string') {
    encodedAddress = bytesToHex(encodedAddress)
  }

  return {
    abi: permissionedResolverSetAddressSnippet,
    functionName: 'setAddress',
    args: [dnsEncodeName(name), BigInt(inputCoinType), encodedAddress],
  } as const satisfies EncodeFunctionDataParameters<
    typeof permissionedResolverSetAddressSnippet
  >
}

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
}: SetTextParametersParameters) =>
  ({
    abi: permissionedResolverSetTextSnippet,
    functionName: 'setText',
    args: [dnsEncodeName(name), key, value ?? ''],
  }) as const satisfies EncodeFunctionDataParameters<
    typeof permissionedResolverSetTextSnippet
  >

export type SetContentHashParametersParameters = {
  /** Name to set the contenthash for (DNS-encoded internally) */
  name: string
  contentHash: string | null
}

export const setContentHashParameters = ({
  name,
  contentHash,
}: SetContentHashParametersParameters) =>
  ({
    abi: permissionedResolverSetContenthashSnippet,
    functionName: 'setContenthash',
    args: [
      dnsEncodeName(name),
      contentHash ? encodeContentHash(contentHash) : '0x',
    ],
  }) as const satisfies EncodeFunctionDataParameters<
    typeof permissionedResolverSetContenthashSnippet
  >

export type SetAbiParametersParameters<
  encodeAs extends AbiEncodeAs = AbiEncodeAs,
> = Prettify<
  {
    /** Name to set the ABI for (DNS-encoded internally) */
    name: string
  } & EncodeAbiParameters<encodeAs>
>

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

export type RecordOptions = Prettify<{
  /** ContentHash value */
  contentHash?: string | null
  /** Array of text records */
  texts?: Omit<SetTextParametersParameters, 'name'>[]
  /** Array of coin records */
  coins?: Omit<SetAddressParametersParameters, 'name'>[]
  /** ABI value */
  abi?: EncodeAbiParameters | EncodeAbiParameters[]
}>

export type ResolverMulticallItem =
  | ReturnType<typeof setContentHashParameters>
  | Awaited<ReturnType<typeof setAbiParameters>>
  | ReturnType<typeof setTextParameters>
  | ReturnType<typeof setAddressParameters>

/**
 * Builds the individual setter calls for a V2 resolver. Each call carries the
 * DNS-encoded name, so the batch needs no separate node argument.
 */
export const resolverMulticallParameters = async ({
  name,
  contentHash,
  texts,
  coins,
  abi,
}: {
  name: string
} & RecordOptions): Promise<ResolverMulticallItem[]> => {
  const calls: ResolverMulticallItem[] = []

  if (contentHash !== undefined) {
    calls.push(setContentHashParameters({ name, contentHash }))
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
