import { Hex } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { Prettify, SimpleTransactionRequest } from '../../types'
import { generateFunction } from '../../utils/generateFunction'
import _getContentHash, {
  InternalGetContentHashParameters,
  InternalGetContentHashReturnType,
} from './_getContentHash'
import universalWrapper from './universalWrapper'

export type GetContentHashParameters =
  Prettify<InternalGetContentHashParameters>

export type GetContentHashReturnType =
  Prettify<InternalGetContentHashReturnType>

const encode = (
  client: ClientWithEns,
  { name }: GetContentHashParameters,
): SimpleTransactionRequest => {
  const prData = _getContentHash.encode(client, { name })
  return universalWrapper.encode(client, { name, data: prData.data })
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
): Promise<GetContentHashReturnType> => {
  const urData = await universalWrapper.decode(client, data)
  if (!urData) return null
  return _getContentHash.decode(client, urData.data)
}

const getContentHash = generateFunction({ encode, decode })

export default getContentHash
