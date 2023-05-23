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
import { setSubnodeRecordSnippet as nameWrapperSetSubnodeRecordSnippet } from '../../contracts/nameWrapper'
import { setSubnodeRecordSnippet as registrySetSubnodeRecordSnippet } from '../../contracts/registry'
import {
  InvalidContractTypeError,
  UnsupportedNameTypeError,
} from '../../errors/general'
import {
  AnyDate,
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
import { CombinedFuseInput, encodeFuses } from '../../utils/fuses'
import { getNameType } from '../../utils/getNameType'
import { makeLabelNodeAndParent } from '../../utils/makeLabelNodeAndParent'
import {
  MAX_EXPIRY,
  expiryToBigInt,
  wrappedLabelLengthCheck,
} from '../../utils/wrapper'

type BaseCreateSubnameDataParameters = {
  name: string
  owner: Address
  contract: 'registry' | 'nameWrapper'
  resolverAddress?: Address
  expiry?: AnyDate
  fuses?: CombinedFuseInput
}

type RegistryCreateSubnameDataParameters = {
  contract: 'registry'
  expiry?: never
  fuses?: never
}

type NameWrapperCreateSubnameDataParameters = {
  contract: 'nameWrapper'
  expiry?: AnyDate
  fuses?: CombinedFuseInput
}

export type CreateSubnameDataParameters = BaseCreateSubnameDataParameters &
  (RegistryCreateSubnameDataParameters | NameWrapperCreateSubnameDataParameters)

export type CreateSubnameDataReturnType = SimpleTransactionRequest

export type CreateSubnameParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  CreateSubnameDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type CreateSubnameReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    contract,
    owner,
    resolverAddress = getChainContractAddress({
      client: wallet,
      contract: 'ensPublicResolver',
    }),
    expiry,
    fuses,
  }: CreateSubnameDataParameters,
): CreateSubnameDataReturnType => {
  const nameType = getNameType(name)
  if (nameType === 'tld' || nameType === 'root')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: [
        'eth-2ld',
        'eth-subname',
        'other-2ld',
        'other-subname',
      ],
    })

  const { label, labelhash, parentNode } = makeLabelNodeAndParent(name)

  switch (contract) {
    case 'registry': {
      return {
        to: getChainContractAddress({
          client: wallet,
          contract: 'ensRegistry',
        }),
        data: encodeFunctionData({
          abi: registrySetSubnodeRecordSnippet,
          functionName: 'setSubnodeRecord',
          args: [parentNode, labelhash, owner, resolverAddress, BigInt(0)],
        }),
      }
    }
    case 'nameWrapper': {
      wrappedLabelLengthCheck(label)
      const generatedFuses = fuses ? encodeFuses(fuses) : 0
      const generatedExpiry = expiry ? expiryToBigInt(expiry) : MAX_EXPIRY
      return {
        to: getChainContractAddress({
          client: wallet,
          contract: 'ensNameWrapper',
        }),
        data: encodeFunctionData({
          abi: nameWrapperSetSubnodeRecordSnippet,
          functionName: 'setSubnodeRecord',
          args: [
            parentNode,
            label,
            owner,
            resolverAddress,
            BigInt(0),
            generatedFuses,
            generatedExpiry,
          ],
        }),
      }
    }
    default:
      throw new InvalidContractTypeError({
        contractType: contract,
        supportedContractTypes: ['registry', 'nameWrapper'],
      })
  }
}

async function createSubname<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    contract,
    owner,
    resolverAddress,
    expiry,
    fuses,
    ...txArgs
  }: CreateSubnameParameters<TChain, TAccount, TChainOverride>,
): Promise<CreateSubnameReturnType> {
  const data = makeFunctionData(wallet, {
    name,
    contract,
    owner,
    resolverAddress,
    expiry,
    fuses,
  } as CreateSubnameDataParameters)
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

createSubname.makeFunctionData = makeFunctionData

export default createSubname
