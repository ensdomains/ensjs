import { Hex, encodeFunctionData, labelhash } from 'viem'
import { ClientWithEns } from '../contracts/consts'
import { ownerOfSnippet } from '../contracts/erc721'
import { getChainContractAddress } from '../contracts/getChainContractAddress'
import { ownerSnippet } from '../contracts/registry'
import { InvalidContractTypeError } from '../errors/general'

export type OwnerContract = 'nameWrapper' | 'registry' | 'registrar'

export type OwnerFromContractArgs = {
  client: ClientWithEns
  contract: OwnerContract
  namehash?: Hex
  labels?: string[]
} & (
  | {
      contract: Exclude<OwnerContract, 'registrar'>
      namehash: Hex
    }
  | {
      contract: 'registrar'
      labels: string[]
    }
)

export const ownerFromContract = ({
  client,
  contract,
  namehash,
  labels,
}: OwnerFromContractArgs) => {
  switch (contract) {
    case 'nameWrapper':
      return {
        to: getChainContractAddress({ client, contract: 'ensNameWrapper' }),
        data: encodeFunctionData({
          abi: ownerOfSnippet,
          functionName: 'ownerOf',
          args: [BigInt(namehash)],
        }),
      }
    case 'registry':
      return {
        to: getChainContractAddress({ client, contract: 'ensRegistry' }),
        data: encodeFunctionData({
          abi: ownerSnippet,
          functionName: 'owner',
          args: [namehash],
        }),
      }
    case 'registrar':
      return {
        to: getChainContractAddress({
          client,
          contract: 'ensBaseRegistrarImplementation',
        }),
        data: encodeFunctionData({
          abi: ownerOfSnippet,
          functionName: 'ownerOf',
          args: [BigInt(labelhash(labels[0]))],
        }),
      }
    default:
      throw new InvalidContractTypeError({
        contractType: contract,
        supportedContractTypes: ['nameWrapper', 'registry', 'registrar'],
      })
  }
}
