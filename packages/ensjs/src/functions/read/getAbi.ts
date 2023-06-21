import { Hex } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { Prettify, SimpleTransactionRequest } from '../../types'
import {
  GeneratedFunction,
  generateFunction,
} from '../../utils/generateFunction'
import _getAbi, {
  InternalGetAbiParameters,
  InternalGetAbiReturnType,
} from './_getAbi'
import universalWrapper from './universalWrapper'

export type GetAbiParameters = Prettify<InternalGetAbiParameters>

export type GetAbiReturnType = Prettify<InternalGetAbiReturnType>

const encode = (
  client: ClientWithEns,
  { name }: GetAbiParameters,
): SimpleTransactionRequest => {
  const prData = _getAbi.encode(client, { name })
  return universalWrapper.encode(client, { name, data: prData.data })
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
): Promise<GetAbiReturnType> => {
  const urData = await universalWrapper.decode(client, data)
  if (!urData) return null
  return _getAbi.decode(client, urData.data)
}

type BatchableFunctionObject = GeneratedFunction<typeof encode, typeof decode>

/**
 * Gets the ABI record for a name
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetAbiParameters}
 * @returns ABI record for the name, or `null` if not found. {@link GetAbiReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addContracts, getAbi } from '@ensdomains/ensjs'
 *
 * const mainnetWithEns = addContracts([mainnet])
 * const client = createPublicClient({
 *   chain: mainnetWithEns,
 *   transport: http(),
 * })
 * const result = await getAbi(client, { name: 'ens.eth' })
 * // TODO: real example
 */
const getAbi = generateFunction({ encode, decode }) as ((
  client: ClientWithEns,
  { name }: GetAbiParameters,
) => Promise<GetAbiReturnType>) &
  BatchableFunctionObject

export default getAbi
