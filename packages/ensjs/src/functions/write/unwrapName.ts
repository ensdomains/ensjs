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
  AdditionalParameterSpecifiedError,
  RequiredParameterNotSpecifiedError,
} from '../../errors/general'
import {
  Eth2ldName,
  Eth2ldNameSpecifier,
  GetNameType,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
import { getNameType } from '../../utils/getNameType'
import { makeLabelNodeAndParent } from '../../utils/makeLabelNodeAndParent'

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
  const nameType = getNameType(name)

  if (nameType === 'eth-2ld') {
    if (!newRegistrantAddress)
      throw new RequiredParameterNotSpecifiedError({
        parameter: 'newRegistrantAddress',
        details: 'Must provide newRegistrantAddress for eth-2ld names',
      })

    return {
      to: nameWrapperAddress,
      data: encodeFunctionData({
        abi: unwrapEth2ldSnippet,
        functionName: 'unwrapETH2LD',
        args: [labelhash, newRegistrantAddress, newOwnerAddress],
      }),
    }
  }

  if (newRegistrantAddress)
    throw new AdditionalParameterSpecifiedError({
      parameter: 'newRegistrantAddress',
      allowedParameters: ['name', 'newOwnerAddress'],
      details: 'newRegistrantAddress can only be specified for eth-2ld names',
    })

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
