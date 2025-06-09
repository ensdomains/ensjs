import {
  type Account,
  type Address,
  type Chain,
  type Client,
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
  type GetChainContractAddressErrorType,
  type Hash,
  type SendTransactionErrorType,
  type SendTransactionParameters,
  type Transport,
} from 'viem'
import { sendTransaction } from 'viem/actions'
import {
  type ChainWithContracts,
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import { nameWrapperSetSubnodeRecordSnippet } from '../../contracts/nameWrapper.js'
import { registrySetSubnodeRecordSnippet } from '../../contracts/registry.js'
import { BaseError } from '../../errors/base.js'
import {
  InvalidContractTypeError,
  UnsupportedNameTypeError,
} from '../../errors/general.js'
import type {
  AnyDate,
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types/index.js'
import {
  ASSERT_NO_TYPE_ERROR,
  EXCLUDE_TYPE_ERROR,
} from '../../types/internal.js'
import {
  type EncodeFusesErrorType,
  type EncodeFusesInputObject,
  encodeFuses,
  ParentFuses,
} from '../../utils/fuses.js'
import { getNameType } from '../../utils/name/getNameType.js'
import {
  type MakeLabelNodeAndParentErrorType,
  makeLabelNodeAndParent,
} from '../../utils/name/makeLabelNodeAndParent.js'
import {
  type ExpiryToBigIntErrorType,
  expiryToBigInt,
  type MakeDefaultExpiryErrorType,
  makeDefaultExpiry,
  type WrappedLabelLengthCheckErrorType,
  wrappedLabelLengthCheck,
} from '../../utils/wrapper.js'
import {
  type GetWrapperDataErrorType,
  getWrapperData,
} from '../public/getWrapperData.js'

type RegistryCreateSubnameDataParameters = {
  contract: 'registry'
  expiry?: never
  fuses?: never
}

type NameWrapperCreateSubnameDataParameters = {
  contract: 'nameWrapper'
  expiry?: AnyDate
  fuses?: EncodeFusesInputObject
}

// ================================
// Errors
// ================================

class CreateSubnamePermissionDeniedError extends BaseError {
  parentName: string

  override name = 'CreateSubnamePermissionDeniedError'

  constructor({ parentName }: { parentName: string }) {
    super(
      `Create subname error: ${parentName} as burned CANNOT_CREATE_SUBDOMAIN fuse`,
    )
    this.parentName = parentName
  }
}

class CreateSubnameParentNotLockedError extends BaseError {
  parentName: string

  override name = 'CreateSubnameParentNotLockedError'

  constructor({ parentName }: { parentName: string }) {
    super(
      `Create subname error: Cannot burn PARENT_CANNOT_CONTROL when ${parentName} has not burned CANNOT_UNWRAP fuse`,
    )
    this.parentName = parentName
  }
}
// ================================
// Make function data
// ================================

export type MakeCreateSubnameFunctionDataParameters = {
  /** Subname to create */
  name: string
  /** New owner of subname */
  owner: Address
  /** Contract to create subname on */
  contract: 'registry' | 'nameWrapper'
  /** Resolver address to set */
  resolverAddress?: Address
  /** Expiry to set (only on NameWrapper) */
  expiry?: AnyDate
  /** Fuses to set (only on NameWrapper) */
  fuses?: EncodeFusesInputObject
} & (
  | RegistryCreateSubnameDataParameters
  | NameWrapperCreateSubnameDataParameters
)

export type MakeCreateSubnameFunctionDataReturnType = SimpleTransactionRequest

export type MakeCreateSubnameFunctionDataErrorType =
  | GetChainContractAddressErrorType
  | UnsupportedNameTypeError
  | MakeLabelNodeAndParentErrorType
  | EncodeFunctionDataErrorType
  | WrappedLabelLengthCheckErrorType
  | EncodeFusesErrorType
  | ExpiryToBigIntErrorType
  | MakeDefaultExpiryErrorType
  | InvalidContractTypeError

export const makeCreateSubnameFunctionData = <
  chain extends Chain,
  account extends Account | undefined,
>(
  wallet: RequireClientContracts<
    chain,
    'ensPublicResolver' | 'ensNameWrapper',
    account
  >,
  {
    name,
    contract,
    owner,
    resolverAddress = getChainContractAddress({
      chain: EXCLUDE_TYPE_ERROR(wallet).chain,
      contract: 'ensPublicResolver',
    }),
    expiry,
    fuses,
  }: MakeCreateSubnameFunctionDataParameters,
): MakeCreateSubnameFunctionDataReturnType => {
  ASSERT_NO_TYPE_ERROR(wallet)

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
          chain: wallet.chain,
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
      const generatedFuses = fuses ? encodeFuses({ input: fuses }) : 0
      const generatedExpiry = expiry
        ? expiryToBigInt(expiry)
        : makeDefaultExpiry(generatedFuses)
      return {
        to: getChainContractAddress({
          chain: wallet.chain,
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

// ================================
// Check can create subname
// ================================

type CheckCanCreateSubnameErrorType =
  | GetWrapperDataErrorType
  | CreateSubnamePermissionDeniedError
  | EncodeFusesErrorType
  | CreateSubnameParentNotLockedError

const checkCanCreateSubname = async (
  wallet: Client<
    Transport,
    ChainWithContracts<'ensPublicResolver' | 'ensNameWrapper'>
  >,
  {
    name,
    fuses,
    contract,
  }: Pick<
    MakeCreateSubnameFunctionDataParameters,
    'name' | 'contract' | 'fuses'
  >,
): Promise<void> => {
  if (contract !== 'nameWrapper') return

  const parentName = name.split('.').slice(1).join('.')
  if (parentName === 'eth') return

  const parentWrapperData = await getWrapperData(wallet, { name: parentName })
  if (parentWrapperData?.fuses?.child?.CANNOT_CREATE_SUBDOMAIN)
    throw new CreateSubnamePermissionDeniedError({ parentName })

  const generatedFuses = fuses ? encodeFuses({ input: fuses }) : 0
  const isBurningPCC =
    fuses && BigInt(generatedFuses) & ParentFuses.PARENT_CANNOT_CONTROL
  const isParentCannotUnwrapBurned =
    parentWrapperData?.fuses?.child?.CANNOT_UNWRAP
  if (isBurningPCC && !isParentCannotUnwrapBurned)
    throw new CreateSubnameParentNotLockedError({ parentName })
}

// ================================
// Create subname
// ================================

export type CreateSubnameParameters<
  chain extends Chain,
  account extends Account | undefined,
  chainOverride extends
    | ChainWithContracts<'ensPublicResolver' | 'ensNameWrapper'>
    | undefined,
> = Prettify<
  MakeCreateSubnameFunctionDataParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type CreateSubnameReturnType = Hash

export type CreateSubnameErrorType =
  | CheckCanCreateSubnameErrorType
  | MakeCreateSubnameFunctionDataErrorType
  | SendTransactionErrorType

/**
 * Creates a subname
 * @param wallet - {@link ClientWithAccount}
 * @param parameters - {@link CreateSubnameParameters}
 * @returns Transaction hash. {@link CreateSubnameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { createSubname } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await createSubname(wallet, {
 *   name: 'sub.ens.eth',
 *   owner: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
 *   contract: 'registry',
 * })
 * // 0x...
 */
export async function createSubname<
  chain extends Chain,
  account extends Account | undefined,
  chainOverride extends
    | ChainWithContracts<'ensPublicResolver' | 'ensNameWrapper'>
    | undefined = ChainWithContracts<'ensPublicResolver' | 'ensNameWrapper'>,
>(
  wallet: RequireClientContracts<
    chain,
    'ensNameWrapper' | 'ensPublicResolver',
    account
  >,
  {
    name,
    contract,
    owner,
    resolverAddress,
    expiry,
    fuses,
    ...txArgs
  }: CreateSubnameParameters<chain, account, chainOverride>,
): Promise<CreateSubnameReturnType> {
  ASSERT_NO_TYPE_ERROR(wallet)

  await checkCanCreateSubname(wallet, { name, fuses, contract })

  const data = makeCreateSubnameFunctionData<typeof wallet.chain, account>(
    wallet,
    {
      name,
      contract,
      owner,
      resolverAddress,
      expiry,
      fuses,
    } as MakeCreateSubnameFunctionDataParameters,
  )
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<typeof wallet.chain, account, chainOverride>

  return sendTransaction(wallet, writeArgs)
}

createSubname.makeFunctionData = makeCreateSubnameFunctionData
