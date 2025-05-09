import {
  type Account,
  type Client,
  type Transport,
  type WriteContractParameters,
  type WriteContractReturnType,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { bulkRenewalRenewAllSnippet } from '../../contracts/bulkRenewal.js'
import type { ChainWithContract } from '../../contracts/consts.js'
import { ethRegistrarControllerRenewSnippet } from '../../contracts/ethRegistrarController.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import type { Prettify, WriteTransactionParameters } from '../../types.js'
import { clientWithOverrides } from '../../utils/clientWithOverrides.js'
import { getNameType } from '../../utils/name/getNameType.js'

export type RenewNamesParameters = {
  /** Name or names to renew */
  nameOrNames: string | string[]
  /** Duration to renew name(s) for */
  duration: bigint | number
  /** Value of all renewals */
  value: bigint
}

type ChainWithContractDependencies = ChainWithContract<
  'ensEthRegistrarController' | 'ensBulkRenewal'
>
export type RenewNamesOptions<
  chain extends ChainWithContractDependencies | undefined,
  account extends Account | undefined,
  chainOverride extends ChainWithContractDependencies | undefined,
> = Prettify<
  RenewNamesParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type RenewNamesReturnType = WriteContractReturnType

export type RenewNamesErrorType = UnsupportedNameTypeError | Error

export const renewNamesWriteParameters = <
  chain extends ChainWithContractDependencies,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  { nameOrNames, duration, value }: RenewNamesParameters,
) => {
  const names = Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames]
  const labels = names.map((name) => {
    const label = name.split('.')
    const nameType = getNameType(name)
    if (nameType !== 'eth-2ld')
      throw new UnsupportedNameTypeError({
        nameType,
        supportedNameTypes: ['eth-2ld'],
        details: 'Only 2ld-eth renewals are currently supported',
      })
    return label[0]
  })

  const baseParams = {
    chain: client.chain,
    account: client.account,
    value,
  } as const

  if (labels.length === 1) {
    return {
      ...baseParams,
      address: getChainContractAddress({
        client,
        contract: 'ensEthRegistrarController',
      }),
      abi: ethRegistrarControllerRenewSnippet,
      functionName: 'renew',
      args: [labels[0], BigInt(duration)],
    } as const satisfies WriteContractParameters
  }

  return {
    ...baseParams,
    address: getChainContractAddress({
      client,
      contract: 'ensBulkRenewal',
    }),
    abi: bulkRenewalRenewAllSnippet,
    functionName: 'renewAll',
    args: [labels, BigInt(duration)],
  } as const satisfies WriteContractParameters
}

/**
 * Renews a name or names for a specified duration.
 * @param client - {@link Client}
 * @param options - {@link RenewNamesOptions}
 * @returns Transaction hash. {@link RenewNamesReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getPrice } from '@ensdomains/ensjs/public'
 * import { renewNames } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 *
 * const duration = 31536000n // 1 year
 * const { base, premium } = await getPrice(wallet, {
 *  nameOrNames: 'example.eth',
 *  duration,
 * })
 * const value = (base + premium) * 110n / 100n // add 10% to the price for buffer
 * const hash = await renewNames(wallet, {
 *   nameOrNames: 'example.eth',
 *   duration,
 *   value,
 * })
 * // 0x...
 */
export async function renewNames<
  chain extends ChainWithContractDependencies | undefined,
  account extends Account | undefined,
  chainOverride extends ChainWithContractDependencies | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    nameOrNames,
    duration,
    value,
    ...txArgs
  }: RenewNamesOptions<chain, account, chainOverride>,
): Promise<RenewNamesReturnType> {
  const writeParameters = renewNamesWriteParameters(
    clientWithOverrides(client, txArgs),
    { nameOrNames, duration, value },
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
