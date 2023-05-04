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
import { unwrapEth2ldSnippet, unwrapSnippet } from '../../contracts/nameWrapper'
import {
  Eth2ldName,
  Eth2ldNameSpecifier,
  GetNameType,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
import { makeLabelNodeAndParent } from '../../utils/makeLabelNodeAndParent'
import { checkIsDotEth } from '../../utils/validation'

type BaseUnwrapNameDataParameters<TName extends string> = {
  name: TName
  newOwnerAddress: Address
  newRegistrantAddress?: Address
}

type Eth2ldUnwrapNameDataParameters = {
  name: Eth2ldName
  newRegistrantAddress: Address
}

type OtherUnwrapNameDataParameters = {
  name: string
  newRegistrantAddress?: never
}

export type UnwrapNameDataParameters<
  TName extends string,
  TNameType extends GetNameType<TName> = GetNameType<TName>,
> = BaseUnwrapNameDataParameters<TName> &
  (TNameType extends Eth2ldNameSpecifier
    ? Eth2ldUnwrapNameDataParameters
    : OtherUnwrapNameDataParameters)

export type UnwrapNameDataReturnType = SimpleTransactionRequest

export type UnwrapNameParameters<
  TName extends string,
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = UnwrapNameDataParameters<TName> &
  WriteTransactionParameters<TChain, TAccount, TChainOverride>

export type UnwrapNameReturnType = Hash

export const makeFunctionData = <
  TName extends string,
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    newOwnerAddress,
    newRegistrantAddress,
  }: UnwrapNameDataParameters<TName>,
): UnwrapNameDataReturnType => {
  const { labelhash, parentNode } = makeLabelNodeAndParent(name)
  const nameWrapperAddress = getChainContractAddress({
    client: wallet,
    contract: 'ensNameWrapper',
  })
  if (checkIsDotEth(name.split('.'))) {
    if (!newRegistrantAddress) {
      throw new Error('Must provide newRegistrantAddress for 2ld .eth names')
    }

    return {
      to: nameWrapperAddress,
      data: encodeFunctionData({
        abi: unwrapEth2ldSnippet,
        functionName: 'unwrapETH2LD',
        args: [labelhash, newRegistrantAddress, newOwnerAddress],
      }),
    }
  }

  if (newRegistrantAddress) {
    throw new Error(
      'newRegistrantAddress can only be specified for 2ld .eth names',
    )
  }

  return {
    to: nameWrapperAddress,
    data: encodeFunctionData({
      abi: unwrapSnippet,
      functionName: 'unwrap',
      args: [parentNode, labelhash, newOwnerAddress],
    }),
  }
}

async function unwrapName<
  TName extends string,
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    newOwnerAddress,
    newRegistrantAddress,
    ...txArgs
  }: UnwrapNameParameters<TName, TChain, TAccount, TChainOverride>,
): Promise<UnwrapNameReturnType> {
  const data = makeFunctionData(wallet, {
    name,
    newOwnerAddress,
    newRegistrantAddress,
  } as UnwrapNameDataParameters<TName>)
  const writeArgs = {
    ...data,
    ...(txArgs as WriteTransactionParameters<TChain, TAccount, TChainOverride>),
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

unwrapName.makeFunctionData = makeFunctionData

export default unwrapName
