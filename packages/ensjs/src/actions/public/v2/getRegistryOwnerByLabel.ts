import type { Client } from 'viem'
import type { Address } from 'viem'
import {
  getRegistryNameData,
  type GetRegistryNameDataErrorType,
} from './getRegistryNameData.js'
import {
  getRegistryOwner,
  type GetRegistryOwnerErrorType,
} from './getRegistryOwner.js'

export type GetRegistryOwnerByLabelParameters = {
  registryAddress: Address
  label: string
}

export type GetRegistryOwnerByLabelErrorType =
  | GetRegistryNameDataErrorType
  | GetRegistryOwnerErrorType

export async function getRegistryOwnerByLabel(
  client: Client,
  { registryAddress, label }: GetRegistryOwnerByLabelParameters,
): Promise<Address> {
  const { tokenId } = await getRegistryNameData(client, {
    registryAddress,
    label,
  })

  return getRegistryOwner(client, {
    registryAddress,
    tokenId,
  })
}