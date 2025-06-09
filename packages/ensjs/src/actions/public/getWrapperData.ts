import {
  type Address,
  type Chain,
  type GetChainContractAddressErrorType,
  type ReadContractErrorType,
  zeroAddress,
} from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import {
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import { nameWrapperGetDataSnippet } from '../../contracts/nameWrapper.js'
import type { Prettify } from '../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import { type DecodedFuses, decodeFuses } from '../../utils/fuses.js'
import { type NamehashErrorType, namehash } from '../../utils/name/namehash.js'

export type GetWrapperDataParameters = {
  /** Name to get wrapper data for */
  name: string
}

export type GetWrapperDataReturnType = Prettify<{
  /** Fuse object */
  fuses: DecodedFuses & {
    value: number
  }
  /** Expiry of the name */
  expiry: bigint | null
  /** Owner of the name */
  owner: Address
} | null>

export type GetWrapperDataErrorType =
  | ReadContractErrorType
  | GetChainContractAddressErrorType
  | NamehashErrorType

/**
 * Gets the wrapper data for a name.
 * @param client - {@link Client}
 * @param parameters - {@link GetWrapperDataParameters}
 * @returns Wrapper data object, or null if name is not wrapped. {@link GetWrapperDataReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getWrapperData } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getWrapperData(client, { name: 'ilikelasagna.eth' })
 */
export async function getWrapperData<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensNameWrapper'>,
  { name }: GetWrapperDataParameters,
): Promise<GetWrapperDataReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')
  const [owner, fuses, expiry] = await readContractAction({
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensNameWrapper',
    }),
    abi: nameWrapperGetDataSnippet,
    functionName: 'getData',
    args: [BigInt(namehash(name))],
  })

  if (owner === zeroAddress) return null

  const fuseObj = decodeFuses(fuses)
  return {
    fuses: {
      ...fuseObj,
      value: fuses,
    },
    expiry: expiry > 0 ? expiry * 1000n : null,
    owner,
  }
}
