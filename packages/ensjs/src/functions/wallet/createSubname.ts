import {
  encodeFunctionData,
  type Account,
  type Address,
  type Hash,
  type SendTransactionParameters,
  type Transport,
  toHex,
  type Hex,
  decodeErrorResult,
  zeroAddress,
  zeroHash,
} from 'viem'
import * as chains from 'viem/chains'
import type { Chain } from 'viem/chains'
import { packetToBytes } from 'viem/ens'
import { sendTransaction, readContract } from 'viem/actions'
import type {
  ChainWithEns,
  ClientWithAccount,
  ClientWithEns,
  WalletClientWithAccount,
} from '../../contracts/consts.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { nameWrapperSetSubnodeRecordSnippet } from '../../contracts/nameWrapper.js'
import { registrySetSubnodeRecordSnippet } from '../../contracts/registry.js'
import {
  InvalidContractTypeError,
  UnsupportedNameTypeError,
} from '../../errors/general.js'
import type {
  AnyDate,
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types.js'
import {
  encodeFuses,
  ParentFuses,
  type EncodeFusesInputObject,
} from '../../utils/fuses.js'
import { getNameType } from '../../utils/getNameType.js'
import { makeLabelNodeAndParent } from '../../utils/makeLabelNodeAndParent.js'
import {
  expiryToBigInt,
  wrappedLabelLengthCheck,
  makeDefaultExpiry,
} from '../../utils/wrapper.js'
import getWrapperData from '../public/getWrapperData.js'
import { BaseError } from '../../errors/base.js'
import {
  erc165SupportsInterfaceSnippet,
  offchainRegisterSnippet,
  // universalResolverResolveSnippet,
  WILDCARD_WRITING_INTERFACE_ID,
  universalResolverFindResolverSnippet,
  type DomainData,
  type MessageData,
  universalResolverResolveSnippet,
} from '../../contracts/index.js'
import {
  ccipRequest,
  getRevertErrorData,
  randomSecret,
} from '../../utils/registerHelpers.js'

type BaseCreateSubnameDataParameters = {
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
  /** Any given hex data to be used on the offchain flow */
  extraData?: Hex
}

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
  wallet: ClientWithAccount<Transport, TChain, TAccount>,
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
      const generatedFuses = fuses ? encodeFuses({ input: fuses }) : 0
      const generatedExpiry = expiry
        ? expiryToBigInt(expiry)
        : makeDefaultExpiry(generatedFuses)
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

class OffchainSubnameError extends BaseError {
  override name = 'OffchainSubnameError'

  constructor(name: string) {
    super(`Create subname error: ${name} is an offchain domain`)
  }
}

class SubnameUnavailableError extends BaseError {
  override name = 'SubnameUnavailableError'

  constructor(name: string) {
    super(`Create subname error: ${name} is unavailable`)
  }
}

const checkCanCreateSubname = async (
  wallet: ClientWithEns,
  {
    name,
    fuses,
    contract,
  }: Pick<BaseCreateSubnameDataParameters, 'name' | 'contract' | 'fuses'>,
): Promise<void> => {
  const [resolver] = await readContract(wallet, {
    address: getChainContractAddress({
      client: wallet,
      contract: 'ensUniversalResolver',
    }),
    abi: universalResolverFindResolverSnippet,
    functionName: 'findResolver',
    args: [toHex(packetToBytes(name))],
  })

  // TODO: check the interface through the resolve function
  const isOffchain = await readContract(wallet, {
    address: resolver,
    abi: erc165SupportsInterfaceSnippet,
    functionName: 'supportsInterface',
    args: [WILDCARD_WRITING_INTERFACE_ID],
  })

  if (isOffchain) throw new OffchainSubnameError(name)

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

function getChain(chainId: number): Chain | undefined {
  return (Object.values(chains) as Chain[]).find(
    (chain) => chain.id === chainId,
  )
}

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
async function createSubname<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletClientWithAccount<Transport, TChain, TAccount>,
  {
    name,
    contract,
    owner,
    resolverAddress,
    expiry,
    fuses,
    extraData = zeroHash,
    ...txArgs
  }: CreateSubnameParameters<TChain, TAccount, TChainOverride>,
): Promise<CreateSubnameReturnType> {
  try {
    await checkCanCreateSubname(wallet, { name, fuses, contract })
  } catch (error) {
    const encodedName = toHex(packetToBytes(name))
    if (error instanceof OffchainSubnameError) {
      const calldata = {
        name: encodedName,
        owner,
        duration: expiry,
        secret: randomSecret(),
        resolver: resolverAddress || zeroAddress,
        extraData,
      }

      try {
        await readContract(wallet, {
          address: getChainContractAddress({
            client: wallet,
            contract: 'ensUniversalResolver',
          }),
          abi: universalResolverResolveSnippet,
          functionName: 'resolve',
          args: [
            encodedName,
            encodeFunctionData({
              functionName: 'getOperationHandler',
              abi: offchainRegisterSnippet,
              args: [
                encodeFunctionData({
                  functionName: 'register',
                  abi: offchainRegisterSnippet,
                  args: [calldata],
                }),
              ],
            }),
          ],
        })
      } catch (offchainError) {
        const data = getRevertErrorData(offchainError)

        if (!data || !Array.isArray(data.args)) throw offchainError

        const [params] = data.args
        const errorResult = decodeErrorResult({
          abi: offchainRegisterSnippet,
          data: params as Hex,
        })

        switch (errorResult?.errorName) {
          case 'OperationHandledOffchain': {
            const [domain, url, message] = errorResult.args as [
              DomainData,
              string,
              MessageData,
            ]

            if (!txArgs.account && !wallet.account) {
              throw new Error('Account is required')
            }

            const signature = await wallet.signTypedData({
              account: txArgs.account! || wallet.account!,
              domain,
              message,
              primaryType: 'Message',
              types: {
                Message: [
                  { name: 'data', type: 'bytes' },
                  { name: 'sender', type: 'address' },
                  { name: 'expirationTimestamp', type: 'uint256' },
                ],
              },
            })

            await ccipRequest({
              data: message.data,
              signature: { message, domain, signature },
              sender: message.sender,
              urls: [url],
            })

            return wallet.chain.id === chains.sepolia.id
              ? '0x1d4cca15a7f535724328cce2ba2c857b158c940aeffb3c3b4a035645da697b25' // random successful sepolia tx hash
              : '0xd4a47f4ff92e1bb213a6f733dc531d1baf4d3e439229bf184aa90b39d2bdb26b' // random successful mainnet tx hash
          }
          case 'OperationHandledOnchain': {
            const currentChain = wallet.chain

            try {
              const [chainId, contractAddress] = errorResult.args as [
                bigint,
                `0x${string}`,
              ]

              if (
                wallet.chain.id !== chains.localhost.id &&
                wallet.chain.id !== Number(chainId)
              ) {
                await wallet.switchChain({ id: Number(chainId) })
                const chain = getChain(Number(chainId))
                if (!chain) throw new Error('Chain not found')
                wallet.chain = chain as TChain
              }

              const registerParams = (await readContract(wallet, {
                address: contractAddress,
                abi: offchainRegisterSnippet,
                functionName: 'registerParams',
                args: [encodedName, expiryToBigInt(expiry)],
              })) as {
                price: bigint
                commitTime: bigint
                extraData: Hex
                available: boolean
                token: Hex
              }

              if (!registerParams.available) {
                throw new SubnameUnavailableError(name)
              }

              return await sendTransaction(wallet, {
                ...txArgs,
                to: contractAddress,
                value: registerParams.price,
                data: encodeFunctionData({
                  functionName: 'register',
                  abi: offchainRegisterSnippet,
                  args: [calldata],
                }),
                gas: 300000n,
              } as SendTransactionParameters<TChain, TAccount, TChainOverride>)
            } finally {
              if (wallet.chain.id !== chains.localhost.id) {
                await wallet.switchChain({ id: currentChain.id })
                wallet.chain = currentChain
              }
            }
          }
          default:
            throw offchainError
        }
      }
    }
  }

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

  return sendTransaction(wallet, writeArgs)
}

createSubname.makeFunctionData = makeFunctionData

export default createSubname
