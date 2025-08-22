import {
  type Chain,
  getChainContractAddress,
  type Hex,
  type LabelhashErrorType,
  labelhash,
  type ReadContractParameters,
} from 'viem'
import type { RequireChainContracts } from '../clients/chain.js'
import { nameWrapperOwnerOfSnippet } from '../contracts/nameWrapper.js'
import { registryOwnerSnippet } from '../contracts/registry.js'
import { InvalidContractTypeError } from '../errors/general.js'
import { ASSERT_NO_TYPE_ERROR } from '../types/internal.js'

export type OwnerContract = 'nameWrapper' | 'registry' | 'registrar'

export type OwnerFromContractArgs = {
  contract: OwnerContract
  node?: Hex
  labels?: string[]
} & (
  | {
      contract: Exclude<OwnerContract, 'registrar'>
      node: Hex
    }
  | {
      contract: 'registrar'
      labels: string[]
    }
)

const abi = [...nameWrapperOwnerOfSnippet, ...registryOwnerSnippet] as const

// ================================
// Get contract specific owner parameters
// ================================

export type GetContractSpecificOwnerParametersErrorType =
  // | GetChainContractAddressErrorType
  InvalidContractTypeError | LabelhashErrorType

export const getContractSpecificOwnerParameters = <_chain extends Chain>(
  chain: RequireChainContracts<
    _chain,
    'ensNameWrapper' | 'ensRegistry' | 'ensBaseRegistrarImplementation'
  >,
  { contract, node, labels }: OwnerFromContractArgs,
) => {
  ASSERT_NO_TYPE_ERROR(chain)

  switch (contract) {
    case 'nameWrapper':
      return {
        address: getChainContractAddress({
          chain,
          contract: 'ensNameWrapper',
        }),
        abi,
        functionName: 'ownerOf',
        args: [BigInt(node)],
      } as const satisfies ReadContractParameters<typeof abi, 'ownerOf'>
    case 'registry':
      return {
        address: getChainContractAddress({ chain, contract: 'ensRegistry' }),
        abi,
        functionName: 'owner',
        args: [node],
      } as const satisfies ReadContractParameters<typeof abi, 'owner'>
    case 'registrar':
      return {
        address: getChainContractAddress({
          chain,
          contract: 'ensBaseRegistrarImplementation',
        }),
        abi,
        functionName: 'ownerOf',
        args: [BigInt(labelhash(labels[0]))],
      } as const satisfies ReadContractParameters<typeof abi, 'ownerOf'>
    default:
      throw new InvalidContractTypeError({
        contractType: contract,
        supportedContractTypes: ['nameWrapper', 'registry', 'registrar'],
      })
  }
}
