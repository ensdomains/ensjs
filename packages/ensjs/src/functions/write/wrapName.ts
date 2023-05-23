import {
  Account,
  Address,
  Hash,
  SendTransactionParameters,
  Transport,
  encodeAbiParameters,
  encodeFunctionData,
  labelhash,
  toHex,
} from 'viem'
import { parseAccount } from 'viem/utils'
import { ChainWithEns, WalletWithEns } from '../../contracts/addContracts'
import { safeTransferFromWithDataSnippet } from '../../contracts/erc721'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { wrapSnippet } from '../../contracts/nameWrapper'
import { AdditionalParameterSpecifiedError } from '../../errors/general'
import {
  Eth2ldNameSpecifier,
  GetNameType,
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
import { CombinedFuseInput, encodeFuses } from '../../utils/fuses'
import { packetToBytes } from '../../utils/hexEncodedName'
import { checkIsDotEth } from '../../utils/validation'
import { wrappedLabelLengthCheck } from '../../utils/wrapper'

export type WrapNameDataParameters<
  TName extends string,
  TNameOption extends GetNameType<TName> = GetNameType<TName>,
> = {
  name: TName
  wrappedOwner: Address
  fuses?: TNameOption extends Eth2ldNameSpecifier
    ? CombinedFuseInput['child']
    : never
  resolverAddress?: Address
}

export type WrapNameDataReturnType = SimpleTransactionRequest

export type WrapNameParameters<
  TName extends string,
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  WrapNameDataParameters<TName> &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type WrapNameReturnType = Hash

export const makeFunctionData = <
  TName extends string,
  TChain extends ChainWithEns,
  TAccount extends Account,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    wrappedOwner,
    fuses,
    resolverAddress = getChainContractAddress({
      client: wallet,
      contract: 'ensPublicResolver',
    }),
  }: WrapNameDataParameters<TName>,
): WrapNameDataReturnType => {
  const labels = name.split('.')
  const isEth2ld = checkIsDotEth(labels)

  const nameWrapperAddress = getChainContractAddress({
    client: wallet,
    contract: 'ensNameWrapper',
  })

  if (isEth2ld) {
    wrappedLabelLengthCheck(labels[0])
    const encodedFuses = fuses ? encodeFuses(fuses, 'child') : 0
    const tokenId = BigInt(labelhash(labels[0]))

    const data = encodeAbiParameters(
      [
        { name: 'label', type: 'string' },
        { name: 'wrappedOwner', type: 'address' },
        { name: 'ownerControlledFuses', type: 'uint16' },
        { name: 'resolverAddress', type: 'address' },
      ],
      [labels[0], wrappedOwner, encodedFuses, resolverAddress],
    )

    return {
      to: getChainContractAddress({
        client: wallet,
        contract: 'ensBaseRegistrarImplementation',
      }),
      data: encodeFunctionData({
        abi: safeTransferFromWithDataSnippet,
        functionName: 'safeTransferFrom',
        args: [wallet.account.address, nameWrapperAddress, tokenId, data],
      }),
    }
  }

  if (fuses)
    throw new AdditionalParameterSpecifiedError({
      parameter: 'fuses',
      allowedParameters: ['name', 'wrappedOwner', 'resolverAddress'],
      details: 'Fuses cannot be initially set when wrapping non eth-2ld names',
    })

  labels.forEach((label) => wrappedLabelLengthCheck(label))
  return {
    to: nameWrapperAddress,
    data: encodeFunctionData({
      abi: wrapSnippet,
      functionName: 'wrap',
      args: [toHex(packetToBytes(name)), wrappedOwner, resolverAddress],
    }),
  }
}

async function wrapName<
  TName extends string,
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    wrappedOwner,
    fuses,
    resolverAddress,
    ...txArgs
  }: WrapNameParameters<TName, TChain, TAccount, TChainOverride>,
): Promise<WrapNameReturnType> {
  const data = makeFunctionData(
    {
      ...wallet,
      account: parseAccount((txArgs.account || wallet.account)!),
    } as WalletWithEns<Transport, TChain, Account>,
    { name, wrappedOwner, fuses, resolverAddress },
  )
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

wrapName.makeFunctionData = makeFunctionData

export default wrapName
