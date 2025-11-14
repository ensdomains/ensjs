
import type { Client } from 'viem'
import type { Address } from 'viem'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { registryOwnerOfSnippet } from '../../../contracts/ethRegistry.js'

export type GetRegistryOwnerParameters = {
  registryAddress: Address
  tokenId: bigint
}

export type GetRegistryOwnerReturnType = Address

export type GetRegistryOwnerErrorType = ReadContractErrorType

export async function getRegistryOwner(
  client: Client,
  { registryAddress, tokenId }: GetRegistryOwnerParameters,
): Promise<GetRegistryOwnerReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  return readContractAction({
    address: registryAddress,
    abi: registryOwnerOfSnippet,
    functionName: 'ownerOf',
    args: [tokenId],
  }) as Promise<Address>
}
