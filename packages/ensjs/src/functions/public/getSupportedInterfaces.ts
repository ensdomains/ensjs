import { BaseError, encodeFunctionData, type Address, type Hex } from 'viem'
import type { ClientWithEns } from '../../contracts/consts.js'
import { erc165SupportsInterfaceSnippet } from '../../contracts/erc165.js'
import type {
  SimpleTransactionRequest,
  TransactionRequestWithPassthrough,
} from '../../types.js'
import { generateFunction } from '../../utils/generateFunction.js'
import multicallWrapper from './multicallWrapper.js'

export type GetSupportedInterfacesParameters = {
  address: Address
  interfaces: Hex[]
}

export type GetSupportedInterfacesReturnType = boolean[]

const encodeInterface = (interfaceId: Hex): Hex =>
  encodeFunctionData({
    abi: erc165SupportsInterfaceSnippet,
    functionName: 'supportsInterface',
    args: [interfaceId],
  })

const encode = (
  client: ClientWithEns,
  { address, interfaces }: GetSupportedInterfacesParameters,
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

const decode = async (
  client: ClientWithEns,
  data: Hex | BaseError,
  passthrough: SimpleTransactionRequest[],
): Promise<GetSupportedInterfacesReturnType> => {
  if (typeof data === 'object') throw data
  const result = await multicallWrapper.decode(client, data, passthrough)
  return result.map((r) => r.success && r.returnData === '0x01')
}

const getSupportedInterfaces = generateFunction({ encode, decode })

export default getSupportedInterfaces
