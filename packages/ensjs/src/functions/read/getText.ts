import { Hex } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { Prettify, SimpleTransactionRequest } from '../../types'
import { generateFunction } from '../../utils/generateFunction'
import _getText, {
  InternalGetTextParameters,
  InternalGetTextReturnType,
} from './_getText'
import universalWrapper from './universalWrapper'

export type GetTextParameters = Prettify<InternalGetTextParameters>

export type GetTextReturnType = Prettify<InternalGetTextReturnType>

const encode = (
  client: ClientWithEns,
  { name, key }: GetTextParameters,
): SimpleTransactionRequest => {
  const prData = _getText.encode(client, { name, key })
  return universalWrapper.encode(client, { name, data: prData.data })
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
): Promise<GetTextReturnType> => {
  const urData = await universalWrapper.decode(client, data)
  if (!urData) return null
  return _getText.decode(client, urData.data)
}

const getText = generateFunction({ encode, decode })

export default getText
