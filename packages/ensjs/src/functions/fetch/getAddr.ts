import { Hex } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { generateFunction } from '../../utils/generateFunction'
import _getAddr from './_getAddr'
import universalWrapper from './universalWrapper'

type GetAddrArgs = {
  name: string
  coin?: string | number
}

type GetAddrResult = {
  id: number
  name: string
  addr: string
}

const encode = async (client: ClientWithEns, { name, coin }: GetAddrArgs) => {
  const prData = await _getAddr.encode(client, { name, coin })
  return universalWrapper.encode(client, name, prData.data)
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
  args: GetAddrArgs,
): Promise<GetAddrResult | null> => {
  const urData = await universalWrapper.decode(client, data)
  if (!urData) return null
  return _getAddr.decode(client, urData.data, args)
}

const getAddr = generateFunction({ encode, decode })

export default getAddr
