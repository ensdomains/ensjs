import { universalResolverV2FindOwnerSnippet } from '@ensdomains/ensjs-abi/universalResolver'
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
import type { RequireClientContracts } from '../../../clients/shared.js'
import { getChainContractAddress } from '../../../clients/shared.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

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
 * @param client - {@link Client}
 * @param parameters - {@link GetOwnerParameters}
 * @returns The owner address, or the zero address if unowned or not found. {@link GetOwnerReturnType}
 */
export async function getOwner<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensUniversalResolver'>,
  { name }: GetOwnerParameters,
): Promise<GetOwnerReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const contractAddress = getChainContractAddress({
    chain: client.chain,
    contract: 'ensUniversalResolver',
  })

  const readContractAction = getAction(client, readContract, 'readContract')

  return readContractAction({
    address: contractAddress,
    abi: universalResolverV2FindOwnerSnippet,
    functionName: 'findOwner',
    args: [toHex(packetToBytes(name))],
  })
}
