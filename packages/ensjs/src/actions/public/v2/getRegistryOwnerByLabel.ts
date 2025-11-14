import type { Client, Address } from 'viem'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { erc1155Abi } from 'viem'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

import {
  getRegistryNameData,
  type GetRegistryNameDataErrorType,
} from './getRegistryNameData.js'

export type GetRegistryOwnerByLabelParameters = {
  registryAddress: Address
  label: string
}

export type GetRegistryOwnerByLabelErrorType =
  | GetRegistryNameDataErrorType
  | ReadContractErrorType


export async function getRegistryOwnerByLabel(
  client: Client,
  { registryAddress, label }: GetRegistryOwnerByLabelParameters,
): Promise<Address> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  const { tokenId } = await getRegistryNameData(client, {
    registryAddress,
    label,
  })

  return await readContractAction({
    address: registryAddress,
    abi: erc1155Abi,
    functionName: 'ownerOf',
    args: [tokenId],
  })

}