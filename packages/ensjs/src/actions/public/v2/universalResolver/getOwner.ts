import { universalHelperFindExactOwnerSnippet } from '@ensdomains/ensjs-abi/v2/universalHelper'
import type {
  Address,
  Chain,
  NamehashErrorType,
  ReadContractErrorType,
} from 'viem'
import { readContract } from 'viem/actions'
import { packetToBytes } from 'viem/ens'
import {
  type GetChainContractAddressErrorType,
  getAction,
  toHex,
} from 'viem/utils'
import type { RequireClientContracts } from '../../../../clients/shared.js'
import { getChainContractAddress } from '../../../../clients/shared.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../../types/internal.js'

export type GetOwnerParameters = {
  name: string
}

export type GetOwnerReturnType = Address

export type GetOwnerErrorType =
  | GetChainContractAddressErrorType
  | ReadContractErrorType
  | NamehashErrorType

/**
 * Find the owner for a V2 name of any depth.
 *
 * Reads `findExactOwner` on the UniversalHelper: the owner of exactly this
 * name. Its sibling `findNearestOwner` walks up to the closest owned ancestor
 * instead, which would report every unregistered name as owned.
 * @param client - {@link Client}
 * @param parameters - {@link GetOwnerParameters}
 * @returns The owner address, or the zero address if unowned or not found. {@link GetOwnerReturnType}
 */
export async function getOwner<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensUniversalHelper'>,
  { name }: GetOwnerParameters,
): Promise<GetOwnerReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const contractAddress = getChainContractAddress({
    chain: client.chain,
    contract: 'ensUniversalHelper',
  })

  const readContractAction = getAction(client, readContract, 'readContract')

  return readContractAction({
    address: contractAddress,
    abi: universalHelperFindExactOwnerSnippet,
    functionName: 'findExactOwner',
    args: [toHex(packetToBytes(name))],
  })
}
