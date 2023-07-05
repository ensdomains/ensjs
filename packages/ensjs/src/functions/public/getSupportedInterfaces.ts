import { Address, Hex, encodeFunctionData } from 'viem'
import { ClientWithEns } from '../../contracts/consts'
import { supportsInterfaceSnippet } from '../../contracts/erc165'
import {
  SimpleTransactionRequest,
  TransactionRequestWithPassthrough,
} from '../../types'
import { generateFunction } from '../../utils/generateFunction'
import multicallWrapper from './multicallWrapper'

export type GetSupportedInterfacesParameters = {
  address: Address
  interfaces: Hex[]
}

export type GetSupportedInterfacesReturnType = boolean[]

const encodeInterface = (interfaceId: Hex): Hex =>
  encodeFunctionData({
    abi: supportsInterfaceSnippet,
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
  data: Hex,
  passthrough: SimpleTransactionRequest[],
): Promise<GetSupportedInterfacesReturnType> => {
  const result = await multicallWrapper.decode(client, data, passthrough)
  return result.map((r) => r.success && r.returnData === '0x01')
}

const getSupportedInterfaces = generateFunction({ encode, decode })

export default getSupportedInterfaces
