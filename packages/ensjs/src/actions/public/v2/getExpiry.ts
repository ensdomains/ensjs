import { type Chain, labelhash, type ReadContractErrorType } from 'viem'
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
}

export type GetExpiryReturnType = bigint

export type GetExpiryErrorType =
  | UnsupportedNameTypeError
  | GetChainContractAddressErrorType
  | ReadContractErrorType

export async function getExpiry<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensRegistry'>,
  { name }: GetExpiryParameters,
): Promise<GetExpiryReturnType> {
  ASSERT_NO_TYPE_ERROR(client)
  const labels = name.split('.')
  if (!checkIsDotEth(labels))
    throw new UnsupportedNameTypeError({
      nameType: getNameType(name),
      supportedNameTypes: ['eth-2ld', 'tld'],
      details:
        'Only the expiry of eth-2ld names can be fetched when using the registrar or l2Registrar contract',
    })

  const readContractAction = getAction(client, readContract, 'readContract')

  const address = getChainContractAddress({
    chain: client.chain,
    contract: 'ensRegistry',
  })

  return readContractAction({
    address,
    abi: permissionedRegistryGetExpirySnippet,
    functionName: 'getExpiry',
    args: [BigInt(labelhash(labels[0]))],
  })
}
