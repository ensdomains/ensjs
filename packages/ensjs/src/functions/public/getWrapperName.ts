import {
  decodeFunctionResult,
  encodeFunctionData,
  hexToBytes,
  type Hex,
} from 'viem'
import type { ClientWithEns } from '../../contracts/consts.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { nameWrapperNamesSnippet } from '../../contracts/nameWrapper.js'
import type { SimpleTransactionRequest } from '../../types.js'
import {
  generateFunction,
  type GeneratedFunction,
} from '../../utils/generateFunction.js'
import { bytesToPacket } from '../../utils/hexEncodedName.js'
import { namehash } from '../../utils/normalise.js'

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
      abi: nameWrapperNamesSnippet,
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
    abi: nameWrapperNamesSnippet,
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
 * import { addEnsContracts, getWrapperName } from '@ensdomains/ensjs'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
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
