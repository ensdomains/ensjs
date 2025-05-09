import { hexToBytes, type Client, type Transport } from 'viem'
import { readContract } from 'viem/actions'
import { getAction, trim } from 'viem/utils'

import type { ChainWithContract } from '../../contracts/consts.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { nameWrapperNamesSnippet } from '../../contracts/nameWrapper.js'
import { bytesToPacket } from '../../utils/name/hexEncodedName.js'
import { namehash } from '../../utils/name/normalise.js'

export type GetWrapperNameParameters = {
  /** Name with unknown labels, e.g. "[4ca938ec1b323ca71c4fb47a712abb68cce1cabf39ea4d6789e42fbc1f95459b].eth" */
  name: string
}

export type GetWrapperNameReturnType = string | null

export type GetWrapperNameErrorType = Error

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
export async function getWrapperName<
  chain extends ChainWithContract<'ensNameWrapper'>,
>(
  client: Client<Transport, chain>,
  { name }: GetWrapperNameParameters,
): Promise<GetWrapperNameReturnType> {
  const readContractAction = getAction(client, readContract, 'readContract')
  const result = await readContractAction({
    address: getChainContractAddress({
      client,
      contract: 'ensNameWrapper',
    }),
    abi: nameWrapperNamesSnippet,
    functionName: 'names',
    args: [namehash(name)],
  })
  if (!result || result === '0x' || trim(result) === '0x00') return null
  return bytesToPacket(hexToBytes(result))
}
