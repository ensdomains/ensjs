import {
  Account,
  Address,
  Hash,
  SendTransactionParameters,
  Transport,
  encodeFunctionData,
  labelhash,
} from 'viem'
import { parseAccount } from 'viem/utils'
import { ChainWithEns, WalletWithEns } from '../../contracts/addContracts'
import { reclaimSnippet } from '../../contracts/baseRegistrar'
import { safeTransferFromSnippet as erc1155SafeTransferFromSnippet } from '../../contracts/erc1155'
import { safeTransferFromSnippet as erc721SafeTransferFromSnippet } from '../../contracts/erc721'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { setOwnerSnippet } from '../../contracts/registry'
import {
  AdditionalParameterSpecifiedError,
  InvalidContractTypeError,
  UnsupportedNameTypeError,
} from '../../errors/general'
import {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
import { getNameType } from '../../utils/getNameType'
import { namehash } from '../../utils/normalise'

type BaseTransferNameDataParameters = {
  name: string
  newOwnerAddress: Address
  contract: 'registry' | 'nameWrapper' | 'registrar'
  reclaim?: boolean
}

type RegistryOrNameWrapperTransferNameDataParameters = {
  contract: 'registry' | 'nameWrapper'
  reclaim?: never
}

type BaseRegistrarTransferNameDataParameters = {
  contract: 'registrar'
  reclaim?: boolean
}

type TransferNameDataParameters = BaseTransferNameDataParameters &
  (
    | RegistryOrNameWrapperTransferNameDataParameters
    | BaseRegistrarTransferNameDataParameters
  )

export type TransferNameDataReturnType = SimpleTransactionRequest

export type TransferNameParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  TransferNameDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type TransferNameReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  { name, newOwnerAddress, contract, reclaim }: TransferNameDataParameters,
): TransferNameDataReturnType => {
  if (reclaim && contract !== 'registrar')
    throw new AdditionalParameterSpecifiedError({
      parameter: 'reclaim',
      allowedParameters: ['name', 'newOwnerAddress', 'contract'],
      details:
        "Can't reclaim a name from any contract other than the registrar",
    })
  switch (contract) {
    case 'registry':
      return {
        to: getChainContractAddress({
          client: wallet,
          contract: 'ensRegistry',
        }),
        data: encodeFunctionData({
          abi: setOwnerSnippet,
          functionName: 'setOwner',
          args: [namehash(name), newOwnerAddress],
        }),
      }
    case 'registrar': {
      const nameType = getNameType(name)
      if (nameType !== 'eth-2ld')
        throw new UnsupportedNameTypeError({
          nameType,
          supportedNameTypes: ['eth-2ld'],
          details:
            'Only eth-2ld names can be transferred on the registrar contract',
        })
      const labels = name.split('.')
      const tokenId = BigInt(labelhash(labels[0]))
      return {
        to: getChainContractAddress({
          client: wallet,
          contract: 'ensBaseRegistrarImplementation',
        }),
        data: reclaim
          ? encodeFunctionData({
              abi: reclaimSnippet,
              functionName: 'reclaim',
              args: [tokenId, newOwnerAddress],
            })
          : encodeFunctionData({
              abi: erc721SafeTransferFromSnippet,
              functionName: 'safeTransferFrom',
              args: [wallet.account.address, newOwnerAddress, tokenId],
            }),
      }
    }
    case 'nameWrapper':
      return {
        to: getChainContractAddress({
          client: wallet,
          contract: 'ensNameWrapper',
        }),
        data: encodeFunctionData({
          abi: erc1155SafeTransferFromSnippet,
          functionName: 'safeTransferFrom',
          args: [
            wallet.account.address,
            newOwnerAddress,
            BigInt(namehash(name)),
            BigInt(1),
            '0x',
          ],
        }),
      }
    default:
      throw new InvalidContractTypeError({
        contractType: contract,
        supportedContractTypes: ['registry', 'registrar', 'nameWrapper'],
      })
  }
}

async function transferName<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    newOwnerAddress,
    contract,
    reclaim,
    ...txArgs
  }: TransferNameParameters<TChain, TAccount, TChainOverride>,
): Promise<TransferNameReturnType> {
  const data = makeFunctionData(
    {
      ...wallet,
      account: parseAccount((txArgs.account || wallet.account)!),
    } as WalletWithEns<Transport, TChain, Account>,
    { name, newOwnerAddress, contract, reclaim } as TransferNameDataParameters,
  )
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

transferName.makeFunctionData = makeFunctionData

export default transferName
