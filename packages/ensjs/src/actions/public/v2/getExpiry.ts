import {
  type Address,
  type Chain,
  keccak256,
  type ReadContractErrorType,
  stringToBytes,
} from 'viem'
import { readContract } from 'viem/actions'
import { type GetChainContractAddressErrorType, getAction } from 'viem/utils'
import type { RequireClientContracts } from '../../../clients/shared.js'
import { getChainContractAddress } from '../../../clients/shared.js'
import { permissionedRegistryGetExpirySnippet } from '../../../contracts/permissionedRegistry.js'
import { UnsupportedNameTypeError } from '../../../errors/general.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { getNameType } from '../../../utils/name/getNameType.js'
import { checkIsDotEth } from '../../../utils/name/validation.js'

export type GetExpiryParameters = {
  /** Name to get expiry for */
  name: string
  /** Optional custom registry address (defaults to chain's ensRegistry) */
  registryAddress?: Address
}

export type GetExpiryReturnType = bigint

export type GetExpiryErrorType =
  | UnsupportedNameTypeError
  | GetChainContractAddressErrorType
  | ReadContractErrorType

export async function getExpiry<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensRegistry'>,
  { name, registryAddress: customRegistryAddress }: GetExpiryParameters,
): Promise<GetExpiryReturnType> {
  ASSERT_NO_TYPE_ERROR(client)
  const labels = name.split('.')
  const nameType = getNameType(name)
  if (!checkIsDotEth(labels) && nameType !== 'eth-subname')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld', 'eth-subname', 'tld'],
      details:
        'Only the expiry of eth-2ld or eth-subname names can be fetched when using the registry',
    })

  if (labels.length > 2)
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld', 'eth-subname', 'tld'],
      details:
        'Only the expiry of eth-2ld names can be fetched when using the registry',
    })

  const readContractAction = getAction(client, readContract, 'readContract')

  const currentRegistry =
    customRegistryAddress ??
    getChainContractAddress({
      chain: client.chain,
      contract: 'ensRegistry',
    })

  const labelHash = BigInt(keccak256(stringToBytes(labels[0])))

  return readContractAction({
    address: currentRegistry,
    abi: permissionedRegistryGetExpirySnippet,
    functionName: 'getExpiry',
    args: [labelHash],
  })
}
