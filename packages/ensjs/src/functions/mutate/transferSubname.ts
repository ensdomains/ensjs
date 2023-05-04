import {
  Account,
  Address,
  Hash,
  SendTransactionParameters,
  Transport,
  encodeFunctionData,
} from 'viem'
import { ChainWithEns, WalletWithEns } from '../../contracts/addContracts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { setSubnodeOwnerSnippet as nameWrapperSetSubnodeOwnerSnippet } from '../../contracts/nameWrapper'
import { setSubnodeOwnerSnippet as registrySetSubnodeOwnerSnippet } from '../../contracts/registry'
import {
  AnyDate,
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
import { makeLabelNodeAndParent } from '../../utils/makeLabelNodeAndParent'
import { expiryToBigInt } from '../../utils/wrapper'

type BaseTransferSubnameDataParameters = {
  name: string
  newOwnerAddress: Address
  contract: 'registry' | 'nameWrapper'
  expiry?: AnyDate
}

type RegistryTransferSubnameDataParameters = {
  contract: 'registry'
  expiry?: never
}

type NameWrapperTransferSubnameDataParameters = {
  contract: 'nameWrapper'
  expiry?: AnyDate
}

type TransferSubnameDataParameters = BaseTransferSubnameDataParameters &
  (
    | RegistryTransferSubnameDataParameters
    | NameWrapperTransferSubnameDataParameters
  )

export type TransferSubnameDataReturnType = SimpleTransactionRequest

export type TransferSubnameParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  TransferSubnameDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type TransferSubnameReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  { name, newOwnerAddress, contract, expiry }: TransferSubnameDataParameters,
): TransferSubnameDataReturnType => {
  const { label, labelhash, parentNode } = makeLabelNodeAndParent(name)
  switch (contract) {
    case 'registry':
      return {
        to: getChainContractAddress({
          client: wallet,
          contract: 'ensRegistry',
        }),
        data: encodeFunctionData({
          abi: registrySetSubnodeOwnerSnippet,
          functionName: 'setSubnodeOwner',
          args: [parentNode, labelhash, newOwnerAddress],
        }),
      }
    case 'nameWrapper':
      return {
        to: getChainContractAddress({
          client: wallet,
          contract: 'ensNameWrapper',
        }),
        data: encodeFunctionData({
          abi: nameWrapperSetSubnodeOwnerSnippet,
          functionName: 'setSubnodeOwner',
          args: [
            parentNode,
            label,
            newOwnerAddress,
            0,
            expiry ? expiryToBigInt(expiry) : BigInt(0),
          ],
        }),
      }
    default:
      throw new Error(`Unknown contract: ${contract}`)
  }
}

async function transferSubname<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    newOwnerAddress,
    contract,
    expiry,
    ...txArgs
  }: TransferSubnameParameters<TChain, TAccount, TChainOverride>,
): Promise<TransferSubnameReturnType> {
  const data = makeFunctionData(wallet, {
    name,
    newOwnerAddress,
    contract,
    expiry,
  } as TransferSubnameDataParameters)
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

transferSubname.makeFunctionData = makeFunctionData

export default transferSubname
