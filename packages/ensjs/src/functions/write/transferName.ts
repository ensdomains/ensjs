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
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
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
    throw new Error("Can't reclaim name from non-registrar contract")
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
      const labels = name.split('.')
      if (labels.length > 2 || labels[1] !== 'eth')
        throw new Error('Invalid name for baseRegistrar')
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
      throw new Error(`Unknown contract: ${contract}`)
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
