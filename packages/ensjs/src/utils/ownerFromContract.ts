import {
  labelhash,
  type Client,
  type Hex,
  type ReadContractParameters,
  type Transport,
} from 'viem'

import type { ChainWithContract } from '../contracts/consts.js'
import { getChainContractAddress } from '../contracts/getChainContractAddress.js'
import { nameWrapperOwnerOfSnippet } from '../contracts/nameWrapper.js'
import { registryOwnerSnippet } from '../contracts/registry.js'
import { InvalidContractTypeError } from '../errors/general.js'

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

export const getContractSpecificOwnerParameters = <
  chain extends ChainWithContract<
    'ensNameWrapper' | 'ensRegistry' | 'ensBaseRegistrarImplementation'
  >,
>(
  client: Client<Transport, chain>,
  { contract, node, labels }: OwnerFromContractArgs,
) => {
  switch (contract) {
    case 'nameWrapper':
      return {
        address: getChainContractAddress({
          client,
          contract: 'ensNameWrapper',
        }),
        abi,
        functionName: 'ownerOf',
        args: [BigInt(node)],
      } as const satisfies ReadContractParameters<typeof abi, 'ownerOf'>
    case 'registry':
      return {
        address: getChainContractAddress({ client, contract: 'ensRegistry' }),
        abi,
        functionName: 'owner',
        args: [node],
      } as const satisfies ReadContractParameters<typeof abi, 'owner'>
    case 'registrar':
      return {
        address: getChainContractAddress({
          client,
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
