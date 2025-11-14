import type { Client } from 'viem'
import type { Address } from 'viem'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { registryGetNameDataSnippet } from '../../../contracts/permissionedRegistry.js'

export type GetRegistryNameDataParameters = {
  registryAddress: Address
  label: string
}

export type RegistryNameDataEntry = {
  expiry: bigint
  tokenVersionId: number
  subregistry: Address
  eacVersionId: number
  resolver: Address
}

export type GetRegistryNameDataReturnType = {
  tokenId: bigint
  entry: RegistryNameDataEntry
}

export type GetRegistryNameDataErrorType = ReadContractErrorType

export async function getRegistryNameData(
  client: Client,
  { registryAddress, label }: GetRegistryNameDataParameters,
): Promise<GetRegistryNameDataReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  const [tokenId, entry] = await readContractAction({
    address: registryAddress,
    abi: registryGetNameDataSnippet,
    functionName: 'getNameData',
    args: [label],
  }) as [
    bigint,
    {
      expiry: bigint
      tokenVersionId: number
      subregistry: Address
      eacVersionId: number
      resolver: Address
    },
  ]

  return {
    tokenId,
    entry,
  }
}