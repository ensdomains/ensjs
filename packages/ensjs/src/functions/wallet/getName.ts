import {
  Address,
  Hex,
  decodeFunctionResult,
  encodeFunctionData,
  toHex,
} from 'viem'
import { ClientWithEns } from '../../contracts/consts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { reverseSnippet } from '../../contracts/universalResolver'
import { SimpleTransactionRequest } from '../../types'
import {
  GeneratedFunction,
  generateFunction,
} from '../../utils/generateFunction'
import { packetToBytes } from '../../utils/hexEncodedName'

export type GetNameParameters = {
  /** Address to get name for */
  address: Address
}

export type GetNameReturnType = {
  /** Primary name for address */
  name: string
  /** Indicates if forward resolution for name matches address */
  match: boolean
  /** Resolver address for reverse node */
  reverseResolverAddress: Address
  /** Resolver address for resolved name */
  resolverAddress: Address
}

const encode = (
  client: ClientWithEns,
  { address }: GetNameParameters,
): SimpleTransactionRequest => {
  const reverseNode = `${address.toLowerCase().substring(2)}.addr.reverse`
  return {
    to: getChainContractAddress({ client, contract: 'ensUniversalResolver' }),
    data: encodeFunctionData({
      abi: reverseSnippet,
      functionName: 'reverse',
      args: [toHex(packetToBytes(reverseNode))],
    }),
  }
}

const decode = async (
  _client: ClientWithEns,
  data: Hex,
  { address }: GetNameParameters,
): Promise<GetNameReturnType | null> => {
  const result = decodeFunctionResult({
    abi: reverseSnippet,
    functionName: 'reverse',
    data,
  })
  if (!result[0]) return null
  return {
    name: result[0],
    match: result[1].toLowerCase() === address.toLowerCase(),
    reverseResolverAddress: result[2],
    resolverAddress: result[3],
  }
}

type BatchableFunctionObject = GeneratedFunction<typeof encode, typeof decode>

/**
 * Gets the primary name for an address
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetNameParameters}
 * @returns Name data object, or `null` if no primary name is set. {@link GetNameReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts, getName } from '@ensdomains/ensjs'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getName(client, { address: '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5' })
 * // { name: 'nick.eth', match: true, reverseResolverAddress: '0xa2c122be93b0074270ebee7f6b7292c7deb45047', resolverAddress: '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41' }
 */
const getName = generateFunction({ encode, decode }) as ((
  client: ClientWithEns,
  { address }: GetNameParameters,
) => Promise<GetNameReturnType>) &
  BatchableFunctionObject

export default getName
