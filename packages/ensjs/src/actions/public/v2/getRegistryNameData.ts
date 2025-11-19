import type { Address, Client } from 'viem'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { permissionedRegistryGetNameDataSnippet } from '../../../contracts/permissionedRegistry.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

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

export type GetRegistryNameDataReturnType = readonly [
  tokenId: bigint,
  entry: RegistryNameDataEntry,
]

export type GetRegistryNameDataErrorType = ReadContractErrorType

export async function getRegistryNameData(
  client: Client,
  { registryAddress, label }: GetRegistryNameDataParameters,
): Promise<GetRegistryNameDataReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  return await readContractAction({
    address: registryAddress,
    abi: permissionedRegistryGetNameDataSnippet,
    functionName: 'getNameData',
    args: [label],
  })
}
