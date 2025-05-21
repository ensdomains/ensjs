import {
  encodeAbiParameters,
  labelhash,
  toHex,
  type Account,
  type Address,
  type Chain,
  type Client,
  type EncodeAbiParametersErrorType,
  type GetChainContractAddressErrorType,
  type LabelhashErrorType,
  type ToHexErrorType,
  type Transport,
  type WriteContractParameters,
  type WriteContractReturnType,
} from 'viem'
import { writeContract } from 'viem/actions'
import { packetToBytes, type PacketToBytesErrorType } from 'viem/ens'
import { getAction } from 'viem/utils'
import { baseRegistrarSafeTransferFromWithDataSnippet } from '../../contracts/baseRegistrar.js'
import type { ChainWithContract } from '../../contracts/consts.js'
import { nameWrapperWrapSnippet } from '../../contracts/nameWrapper.js'
import { AdditionalParameterSpecifiedError } from '../../errors/general.js'
import type {
  ErrorType,
  WrappedLabelTooLargeError,
} from '../../errors/utils.js'
import type {
  Eth2ldNameSpecifier,
  GetNameType,
  WriteTransactionParameters,
} from '../../types/index.js'
import { clientWithOverrides } from '../../utils/clientWithOverrides.js'
import {
  encodeFuses,
  type EncodeChildFusesInputObject,
  type EncodeFusesErrorType,
} from '../../utils/fuses.js'
import { checkIsDotEth } from '../../utils/name/validation.js'
import {
  wrappedLabelLengthCheck,
  type WrappedLabelLengthCheckErrorType,
} from '../../utils/wrapper.js'
import {
  getChainContractAddress,
  type ChainWithContracts,
  type RequireClientContracts,
} from '../../clients/chain.js'
import {
  ASSERT_NO_TYPE_ERROR,
  EXCLUDE_TYPE_ERROR,
} from '../../types/internal.js'

export type WrapNameWriteParameters<name extends string> = {
  /** The name to wrap */
  name: name
  /** The recipient of the wrapped name */
  newOwnerAddress: Address
  /** Fuses to set on wrap (eth-2ld only) */
  fuses?: GetNameType<name> extends Eth2ldNameSpecifier
    ? EncodeChildFusesInputObject
    : never
  /** The resolver address to set on wrap */
  resolverAddress?: Address
}

type ChainWithContractDependencies = ChainWithContract<
  'ensPublicResolver' | 'ensNameWrapper' | 'ensBaseRegistrarImplementation'
>

type WrapNameWriteParametersErrorType =
  | AdditionalParameterSpecifiedError
  | WrappedLabelTooLargeError
  | GetChainContractAddressErrorType
  | WrappedLabelLengthCheckErrorType
  | EncodeFusesErrorType
  | LabelhashErrorType
  | EncodeAbiParametersErrorType
  | ToHexErrorType
  | PacketToBytesErrorType
  | ErrorType

export const wrapNameWriteParameters = <
  name extends string,
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<
    chain,
    'ensPublicResolver' | 'ensNameWrapper' | 'ensBaseRegistrarImplementation',
    account
  >,
  {
    name,
    newOwnerAddress,
    fuses,
    resolverAddress = getChainContractAddress({
      chain: EXCLUDE_TYPE_ERROR(client).chain,
      contract: 'ensPublicResolver',
    }),
  }: WrapNameWriteParameters<name>,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const labels = name.split('.')
  const isEth2ld = checkIsDotEth(labels)

  const nameWrapperAddress = getChainContractAddress({
    chain: client.chain,
    contract: 'ensNameWrapper',
  })

  if (isEth2ld) {
    wrappedLabelLengthCheck(labels[0])
    const encodedFuses = fuses
      ? encodeFuses({ restriction: 'child', input: fuses })
      : 0
    const tokenId = BigInt(labelhash(labels[0]))

    const data = encodeAbiParameters(
      [
        { name: 'label', type: 'string' },
        { name: 'wrappedOwner', type: 'address' },
        { name: 'ownerControlledFuses', type: 'uint16' },
        { name: 'resolverAddress', type: 'address' },
      ],
      [labels[0], newOwnerAddress, encodedFuses, resolverAddress],
    )

    return {
      address: getChainContractAddress({
        chain: client.chain,
        contract: 'ensBaseRegistrarImplementation',
      }),
      abi: baseRegistrarSafeTransferFromWithDataSnippet,
      functionName: 'safeTransferFrom',
      args: [client.account.address, nameWrapperAddress, tokenId, data],
      chain: client.chain,
      account: client.account,
    } as const satisfies WriteContractParameters<
      typeof baseRegistrarSafeTransferFromWithDataSnippet
    >
  }

  if (fuses)
    throw new AdditionalParameterSpecifiedError({
      parameter: 'fuses',
      allowedParameters: ['name', 'wrappedOwner', 'resolverAddress'],
      details: 'Fuses cannot be initially set when wrapping non eth-2ld names',
    })

  labels.forEach((label) => wrappedLabelLengthCheck(label))
  return {
    address: nameWrapperAddress,
    abi: nameWrapperWrapSnippet,
    functionName: 'wrap',
    args: [toHex(packetToBytes(name)), newOwnerAddress, resolverAddress],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<typeof nameWrapperWrapSnippet>
}

// ================================
// Action
// ================================

export type WrapNameParameters<
  name extends string,
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensNameWrapper'>,
> = WrapNameWriteParameters<name> &
  WriteTransactionParameters<chain, account, chainOverride>

export type WrapNameReturnType = WriteContractReturnType

export type WrapNameErrorType =
  | AdditionalParameterSpecifiedError
  | WrappedLabelTooLargeError
  | ErrorType

/**
 * Wraps a name.
 * @param client - {@link Client}
 * @param options - {@link WrapNameParameters}
 * @returns Transaction hash. {@link WrapNameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { wrapName } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await wrapName(wallet, {
 *   name: 'ens.eth',
 *   newOwnerAddress: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
 * })
 * // 0x...
 */
export async function wrapName<
  name extends string,
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<
    'ensPublicResolver' | 'ensNameWrapper' | 'ensBaseRegistrarImplementation'
  >,
>(
  client: RequireClientContracts<
    chain,
    'ensPublicResolver' | 'ensNameWrapper' | 'ensBaseRegistrarImplementation',
    account
  >,
  {
    name,
    newOwnerAddress,
    fuses,
    resolverAddress,
    ...txArgs
  }: WrapNameParameters<name, chain, account, chainOverride>,
): Promise<WrapNameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = wrapNameWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      name,
      newOwnerAddress,
      fuses,
      resolverAddress,
    },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
