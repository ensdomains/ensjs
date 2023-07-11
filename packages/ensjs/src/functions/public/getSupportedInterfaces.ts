import {
  BaseError,
  encodeFunctionData,
  padHex,
  type Address,
  type Hex,
} from 'viem'
import type { ClientWithEns } from '../../contracts/consts.js'
import { erc165SupportsInterfaceSnippet } from '../../contracts/erc165.js'
import type {
  SimpleTransactionRequest,
  TransactionRequestWithPassthrough,
} from '../../types.js'
import { generateFunction } from '../../utils/generateFunction.js'
import multicallWrapper from './multicallWrapper.js'

export type GetSupportedInterfacesParameters<
  TInterfaces extends readonly Hex[],
> = {
  address: Address
  interfaces: TInterfaces
}

export type GetSupportedInterfacesReturnType<
  TInterfaces extends readonly Hex[],
> = {
  -readonly [K in keyof TInterfaces]: boolean
}

const encodeInterface = (interfaceId: Hex): Hex =>
  encodeFunctionData({
    abi: erc165SupportsInterfaceSnippet,
    functionName: 'supportsInterface',
    args: [interfaceId],
  })

const encode = <TInterfaces extends Hex[]>(
  client: ClientWithEns,
  { address, interfaces }: GetSupportedInterfacesParameters<TInterfaces>,
): TransactionRequestWithPassthrough => {
  const calls = interfaces.map((interfaceId) => ({
    to: address,
    data: encodeInterface(interfaceId),
  }))
  const encoded = multicallWrapper.encode(client, {
    transactions: calls,
  })
  return {
    ...encoded,
    passthrough: calls,
  }
}

const decode = async <const TInterfaces extends readonly Hex[]>(
  client: ClientWithEns,
  data: Hex | BaseError,
  passthrough: SimpleTransactionRequest[],
): Promise<GetSupportedInterfacesReturnType<TInterfaces>> => {
  if (typeof data === 'object') throw data
  const result = await multicallWrapper.decode(client, data, passthrough)
  return result.map(
    (r) => r.success && r.returnData === padHex('0x01'),
  ) as GetSupportedInterfacesReturnType<TInterfaces>
}

type EncoderFunction = typeof encode
type DecoderFunction = typeof decode

type BatchableFunctionObject = {
  encode: EncoderFunction
  decode: DecoderFunction
  batch: <
    const TInterfaces extends readonly Hex[],
    TParams extends GetSupportedInterfacesParameters<TInterfaces>,
  >(
    args: TParams,
  ) => {
    args: [TParams]
    encode: EncoderFunction
    decode: typeof decode<TInterfaces>
  }
}

const getSupportedInterfaces = generateFunction({ encode, decode }) as (<
  const TInterfaces extends readonly Hex[],
>(
  client: ClientWithEns,
  { address, interfaces }: GetSupportedInterfacesParameters<TInterfaces>,
) => Promise<GetSupportedInterfacesReturnType<TInterfaces>>) &
  BatchableFunctionObject

export default getSupportedInterfaces
