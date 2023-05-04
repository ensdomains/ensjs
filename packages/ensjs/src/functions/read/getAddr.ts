import { Hex } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { Prettify, SimpleTransactionRequest } from '../../types'
import { generateFunction } from '../../utils/generateFunction'
import _getAddr, {
  InternalGetAddrParameters,
  InternalGetAddrReturnType,
} from './_getAddr'
import universalWrapper from './universalWrapper'

export type GetAddrParameters = Prettify<InternalGetAddrParameters>

export type GetAddrReturnType = Prettify<InternalGetAddrReturnType>

const encode = (
  client: ClientWithEns,
  { name, coin }: GetAddrParameters,
): SimpleTransactionRequest => {
  const prData = _getAddr.encode(client, { name, coin })
  return universalWrapper.encode(client, { name, data: prData.data })
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
  args: GetAddrParameters,
): Promise<GetAddrReturnType> => {
  const urData = await universalWrapper.decode(client, data)
  if (!urData) return null
  return _getAddr.decode(client, urData.data, args)
}

const getAddr = generateFunction({ encode, decode })

export default getAddr
