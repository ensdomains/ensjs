import { Hex } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { generateFunction } from '../../utils/generateFunction'
import _getAddr from './_getAddr'
import universalWrapper from './universalWrapper'

const encode = async (
  client: ClientWithEns,
  name: string,
  coinType?: string | number,
) => {
  const prData = await _getAddr.encode(client, name, coinType)
  return universalWrapper.encode(client, name, prData.data)
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
  _name: string,
  coinType?: string | number,
) => {
  const urData = await universalWrapper.decode(client, data)
  if (!urData) return
  return _getAddr.decode(client, urData.data, _name, coinType)
}

const getAddr = generateFunction({ encode, decode })

export default getAddr
