import {
  Address,
  Hex,
  decodeFunctionResult,
  encodeFunctionData,
  toHex,
} from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { findResolverSnippet } from '../../contracts/universalResolver'
import { SimpleTransactionRequest } from '../../types'
import { EMPTY_ADDRESS } from '../../utils/consts'
import {
  GeneratedFunction,
  generateFunction,
} from '../../utils/generateFunction'
import { packetToBytes } from '../../utils/hexEncodedName'

export type GetResolverParameters = {
  /** Name to get resolver for */
  name: string
}

export type GetResolverReturnType = Address | null

const encode = (
  client: ClientWithEns,
  { name }: GetResolverParameters,
): SimpleTransactionRequest => {
  return {
    to: getChainContractAddress({ client, contract: 'ensUniversalResolver' }),
    data: encodeFunctionData({
      abi: findResolverSnippet,
      functionName: 'findResolver',
      args: [toHex(packetToBytes(name))],
    }),
  }
}

const decode = async (
  _client: ClientWithEns,
  data: Hex,
): Promise<GetResolverReturnType> => {
  const response = decodeFunctionResult({
    abi: findResolverSnippet,
    functionName: 'findResolver',
    data,
  })

  if (response[0] === EMPTY_ADDRESS) return null

  return response[0]
}

type BatchableFunctionObject = GeneratedFunction<typeof encode, typeof decode>

/**
 * Gets the resolver address for a name.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetResolverParameters}
 * @returns Resolver address, or null if none is found. {@link GetResolverReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addContracts, getResolver } from '@ensdomains/ensjs'
 *
 * const mainnetWithEns = addContracts([mainnet])
 * const client = createPublicClient({
 *   chain: mainnetWithEns,
 *   transport: http(),
 * })
 * const result = await getResolver(client, { name: 'ens.eth' })
 * // 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41
 */
const getResolver = generateFunction({ encode, decode }) as ((
  client: ClientWithEns,
  { name }: GetResolverParameters,
) => Promise<GetResolverReturnType>) &
  BatchableFunctionObject

export default getResolver
