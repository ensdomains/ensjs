import {
  type Chain,
  type GetChainContractAddressErrorType,
  type HexToBytesErrorType,
  hexToBytes,
  type ReadContractErrorType,
  type TrimErrorType,
} from 'viem'
import { readContract } from 'viem/actions'
import { getAction, trim } from 'viem/utils'
import {
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import { nameWrapperNamesSnippet } from '../../contracts/nameWrapper.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import {
  type BytesToPacketErrorType,
  bytesToPacket,
} from '../../utils/name/hexEncodedName.js'
import { type NamehashErrorType, namehash } from '../../utils/name/namehash.js'

export type GetWrapperNameParameters = {
  /** Name with unknown labels, e.g. "[4ca938ec1b323ca71c4fb47a712abb68cce1cabf39ea4d6789e42fbc1f95459b].eth" */
  name: string
}

export type GetWrapperNameReturnType = string | null

export type GetWrapperNameErrorType =
  | ReadContractErrorType
  | GetChainContractAddressErrorType
  | NamehashErrorType
  | TrimErrorType
  | BytesToPacketErrorType
  | HexToBytesErrorType

/**
 * Gets the full name for a name with unknown labels from the NameWrapper.
 * @param client - {@link Client}
 * @param parameters - {@link GetWrapperNameParameters}
 * @returns Full name, or null if name was not found. {@link GetWrapperNameReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getWrapperName } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getWrapperName(client, { name: '[4ca938ec1b323ca71c4fb47a712abb68cce1cabf39ea4d6789e42fbc1f95459b].eth' })
 * // wrapped.eth
 */
export async function getWrapperName<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensNameWrapper'>,
  { name }: GetWrapperNameParameters,
): Promise<GetWrapperNameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')
  const result = await readContractAction({
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensNameWrapper',
    }),
    abi: nameWrapperNamesSnippet,
    functionName: 'names',
    args: [namehash(name)],
  })
  if (!result || result === '0x' || trim(result) === '0x00') return null
  return bytesToPacket(hexToBytes(result))
}
