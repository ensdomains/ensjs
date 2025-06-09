import type {
  Account,
  Chain,
  GetChainContractAddressErrorType,
  Hash,
  WriteContractParameters,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import {
  type ChainWithContracts,
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import { nameWrapperSetFusesSnippet } from '../../contracts/nameWrapper.js'
import type { Prettify, WriteTransactionParameters } from '../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import {
  type EncodeChildFusesInputObject,
  type EncodeFusesErrorType,
  encodeFuses,
} from '../../utils/fuses.js'
import { type NamehashErrorType, namehash } from '../../utils/name/namehash.js'

export type SetFusesWriteParametersParameters = {
  /** Name to set fuses for */
  name: string
  /** Fuse object to set to */
  fuses: EncodeChildFusesInputObject
}

export type SetFusesWriteParametersReturnType = ReturnType<
  typeof setFusesWriteParameters
>

export type SetFusesWriteParametersErrorType =
  | EncodeFusesErrorType
  | GetChainContractAddressErrorType
  | NamehashErrorType

export const setFusesWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<chain, 'ensNameWrapper', account>,
  { name, fuses }: SetFusesWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const encodedFuses = encodeFuses({ restriction: 'child', input: fuses })
  return {
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensNameWrapper',
    }),
    abi: nameWrapperSetFusesSnippet,
    functionName: 'setFuses',
    args: [namehash(name), encodedFuses],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof nameWrapperSetFusesSnippet
  >
}

// ================================
// Action
// ================================

export type SetFusesParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensNameWrapper'>,
> = Prettify<
  SetFusesWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type SetFusesReturnType = Hash

export type SetFusesErrorType = Error

/**
 * Sets the fuses for a name.
 * @param client - {@link Client}
 * @param options - {@link SetFusesParameters}
 * @returns Transaction hash. {@link SetFusesReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { setFuses } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setFuses(wallet, {
 *   name: 'sub.ens.eth',
 *   fuses: {
 *     named: ['CANNOT_TRANSFER'],
 *   },
 * })
 * // 0x...
 */
export async function setFuses<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensNameWrapper'>,
>(
  client: RequireClientContracts<chain, 'ensNameWrapper', account>,
  { name, fuses, ...txArgs }: SetFusesParameters<chain, account, chainOverride>,
): Promise<SetFusesReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const data = setFusesWriteParameters<chain, account>(client, {
    name,
    fuses,
  })

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...data,
    ...txArgs,
  } as WriteContractParameters)
}
