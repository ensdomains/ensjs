import {
  type Account,
  type Address,
  type Client,
  type Hash,
  type Transport,
  type WriteContractParameters,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type { ChainWithContract } from '../../contracts/consts.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import {
  nameWrapperUnwrapEth2ldSnippet,
  nameWrapperUnwrapSnippet,
} from '../../contracts/nameWrapper.js'
import {
  AdditionalParameterSpecifiedError,
  RequiredParameterNotSpecifiedError,
} from '../../errors/general.js'
import type {
  Eth2ldNameSpecifier,
  GetNameType,
  WriteTransactionParameters,
} from '../../types.js'
import { clientWithOverrides } from '../../utils/clientWithOverrides.js'
import { getNameType } from '../../utils/name/getNameType.js'
import { makeLabelNodeAndParent } from '../../utils/name/makeLabelNodeAndParent.js'

export type UnwrapNameParameters<name extends string> = {
  /** The name to unwrap */
  name: name
  /** The recipient of the unwrapped name */
  newOwnerAddress: Address
  /** The registrant of the unwrapped name (eth-2ld only) */
  newRegistrantAddress?: Address
} & (GetNameType<name> extends Eth2ldNameSpecifier
  ? {
      newRegistrantAddress: Address
    }
  : {
      newRegistrantAddress?: never
    })

type ChainWithContractDependencies = ChainWithContract<'ensNameWrapper'>
export type UnwrapNameOptions<
  name extends string,
  chain extends ChainWithContractDependencies | undefined,
  account extends Account | undefined,
  chainOverride extends ChainWithContractDependencies | undefined,
> = UnwrapNameParameters<name> &
  WriteTransactionParameters<chain, account, chainOverride>

export type UnwrapNameReturnType = Hash

export type UnwrapNameErrorType =
  | AdditionalParameterSpecifiedError
  | RequiredParameterNotSpecifiedError
  | Error

export const unwrapNameWriteParameters = <
  name extends string,
  chain extends ChainWithContractDependencies,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  { name, newOwnerAddress, newRegistrantAddress }: UnwrapNameParameters<name>,
) => {
  const { labelhash, parentNode } = makeLabelNodeAndParent(name)
  const nameWrapperAddress = getChainContractAddress({
    client,
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
      address: nameWrapperAddress,
      abi: nameWrapperUnwrapEth2ldSnippet,
      functionName: 'unwrapETH2LD',
      args: [labelhash, newRegistrantAddress, newOwnerAddress],
      chain: client.chain,
      account: client.account,
    } as const satisfies WriteContractParameters<
      typeof nameWrapperUnwrapEth2ldSnippet
    >
  }

  if (newRegistrantAddress)
    throw new AdditionalParameterSpecifiedError({
      parameter: 'newRegistrantAddress',
      allowedParameters: ['name', 'newOwnerAddress'],
      details: 'newRegistrantAddress can only be specified for eth-2ld names',
    })

  return {
    address: nameWrapperAddress,
    abi: nameWrapperUnwrapSnippet,
    functionName: 'unwrap',
    args: [parentNode, labelhash, newOwnerAddress],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<typeof nameWrapperUnwrapSnippet>
}

/**
 * Unwraps a name.
 * @param client - {@link Client}
 * @param options - {@link UnwrapNameOptions}
 * @returns Transaction hash. {@link UnwrapNameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { unwrapName } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await unwrapName(wallet, {
 *   name: 'example.eth',
 *   newOwnerAddress: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
 *   newRegistrantAddress: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
 * })
 * // 0x...
 */
export async function unwrapName<
  name extends string,
  chain extends ChainWithContractDependencies | undefined,
  account extends Account | undefined,
  chainOverride extends ChainWithContractDependencies | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    name,
    newOwnerAddress,
    newRegistrantAddress,
    ...txArgs
  }: UnwrapNameOptions<name, chain, account, chainOverride>,
): Promise<UnwrapNameReturnType> {
  const writeParameters = unwrapNameWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      name,
      newOwnerAddress,
      newRegistrantAddress,
    } as UnwrapNameParameters<name>,
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
