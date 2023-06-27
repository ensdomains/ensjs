import { Hex, decodeFunctionResult, encodeFunctionData, hexToBytes } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { namesSnippet } from '../../contracts/nameWrapper'
import { SimpleTransactionRequest } from '../../types'
import {
  GeneratedFunction,
  generateFunction,
} from '../../utils/generateFunction'
import { bytesToPacket } from '../../utils/hexEncodedName'
import { namehash } from '../../utils/normalise'

export type GetWrapperNameParameters = {
  /** Name with unknown labels, e.g. "[4ca938ec1b323ca71c4fb47a712abb68cce1cabf39ea4d6789e42fbc1f95459b].eth" */
  name: string
}

export type GetWrapperNameReturnType = string | null

const encode = (
  client: ClientWithEns,
  { name }: GetWrapperNameParameters,
): SimpleTransactionRequest => {
  return {
    to: getChainContractAddress({ client, contract: 'ensNameWrapper' }),
    data: encodeFunctionData({
      abi: namesSnippet,
      functionName: 'names',
      args: [namehash(name)],
    }),
  }
}

const decode = async (
  _client: ClientWithEns,
  data: Hex,
): Promise<GetWrapperNameReturnType> => {
  const result = decodeFunctionResult({
    abi: namesSnippet,
    functionName: 'names',
    data,
  })
  if (!result || result === '0x' || BigInt(result) === 0n) return null
  return bytesToPacket(hexToBytes(result))
}

type BatchableFunctionObject = GeneratedFunction<typeof encode, typeof decode>

/**
 * Gets the full name for a name with unknown labels from the NameWrapper.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetWrapperNameParameters}
 * @returns Full name, or null if name was not found. {@link GetWrapperNameReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addContracts, getWrapperName } from '@ensdomains/ensjs'
 *
 * const mainnetWithEns = addContracts([mainnet])
 * const client = createPublicClient({
 *   chain: mainnetWithEns,
 *   transport: http(),
 * })
 * const result = await getWrapperName(client, { name: '[4ca938ec1b323ca71c4fb47a712abb68cce1cabf39ea4d6789e42fbc1f95459b].eth' })
 * // wrapped.eth
 */
const getWrapperName = generateFunction({ encode, decode }) as ((
  client: ClientWithEns,
  { name }: GetWrapperNameParameters,
) => Promise<GetWrapperNameReturnType>) &
  BatchableFunctionObject

export default getWrapperName
