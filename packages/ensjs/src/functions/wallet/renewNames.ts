import {
  type Account,
  type Hash,
  type Hex,
  type SendTransactionParameters,
  type Transport,
  encodeFunctionData,
  zeroHash,
} from 'viem'
import { sendTransaction } from 'viem/actions'
import {
  bulkRenewalRenewAllSnippet,
  wrappedBulkRenewalRenewAllSnippet,
} from '../../contracts/bulkRenewal.js'
import type { ChainWithEns, ClientWithAccount } from '../../contracts/consts.js'
import {
  ethRegistrarControllerRenewSnippet,
  wrappedEthRegistrarControllerRenewSnippet,
} from '../../contracts/ethRegistrarController.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import {
  AdditionalParameterSpecifiedError,
  UnsupportedNameTypeError,
} from '../../errors/general.js'
import type {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types.js'
import { getNameType } from '../../utils/getNameType.js'
import getWrapperData from '../public/getWrapperData.js'

export type RenewNamesDataParameters = {
  /** Name or names to renew */
  nameOrNames: string | string[]
  /** Duration to renew name(s) for */
  duration: bigint | number
  /** Value of all renewals */
  value: bigint
  /** Whether any of the names are wrapped - if not provided, will be auto-detected */
  containsWrappedNames?: boolean
  /** Referrer value */
  referrer?: Hex
}

export type RenewNamesDataReturnType = SimpleTransactionRequest & {
  value: bigint
}

export type RenewNamesParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  RenewNamesDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type RenewNamesReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  wallet: ClientWithAccount<Transport, TChain, TAccount>,
  {
    nameOrNames,
    duration,
    value,
    containsWrappedNames,
    referrer = zeroHash,
  }: RenewNamesDataParameters,
): RenewNamesDataReturnType => {
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

  if (containsWrappedNames) {
    if (referrer)
      throw new AdditionalParameterSpecifiedError({
        parameter: 'referrer',
        allowedParameters: [
          'nameOrNames',
          'duration',
          'value',
          'containsWrappedNames',
        ],
        details: 'referrer cannot be specified when renewing wrapped names',
      })

    if (labels.length === 1)
      return {
        to: getChainContractAddress({
          client: wallet,
          contract: 'ensWrappedEthRegistrarController',
        }),
        data: encodeFunctionData({
          abi: wrappedEthRegistrarControllerRenewSnippet,
          functionName: 'renew',
          args: [labels[0], BigInt(duration)],
        }),
        value,
      }

    return {
      to: getChainContractAddress({
        client: wallet,
        contract: 'ensWrappedBulkRenewal',
      }),
      data: encodeFunctionData({
        abi: wrappedBulkRenewalRenewAllSnippet,
        functionName: 'renewAll',
        args: [labels, BigInt(duration)],
      }),
      value,
    }
  }

  if (labels.length === 1) {
    return {
      to: getChainContractAddress({
        client: wallet,
        contract: 'ensEthRegistrarController',
      }),
      data: encodeFunctionData({
        abi: ethRegistrarControllerRenewSnippet,
        functionName: 'renew',
        args: [labels[0], BigInt(duration), referrer],
      }),
      value,
    }
  }

  return {
    to: getChainContractAddress({
      client: wallet,
      contract: 'ensBulkRenewal',
    }),
    data: encodeFunctionData({
      abi: bulkRenewalRenewAllSnippet,
      functionName: 'renewAll',
      args: [labels, BigInt(duration), referrer],
    }),
    value,
  }
}

/**
 * Checks if any of the provided names are wrapped
 * @param wallet - Client to use for checking
 * @param names - Array of names to check
 * @returns True if any name is wrapped
 */
async function checkContainsWrappedNames<TChain extends ChainWithEns>(
  wallet: ClientWithAccount<Transport, TChain, Account | undefined>,
  names: string[],
): Promise<boolean> {
  const checks = await Promise.all(
    names.map(async (name) => {
      const wrapperData = await getWrapperData(wallet, { name })
      // getWrapperData returns null for unwrapped names (owner === EMPTY_ADDRESS)
      return wrapperData !== null
    })
  )
  return checks.some(isWrapped => isWrapped)
}

/**
 * Renews a name or names for a specified duration.
 * @param wallet - {@link ClientWithAccount}
 * @param parameters - {@link RenewNamesParameters}
 * @returns Transaction hash. {@link RenewNamesReturnType}
 *
 * @example
 * import { createPublicClient, createWalletClient, http, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getPrice } from '@ensdomains/ensjs/public'
 * import { renewNames } from '@ensdomains/ensjs/wallet'
 *
 * const mainnetWithEns = addEnsContracts(mainnet)
 * const client = createPublicClient({
 *   chain: mainnetWithEns,
 *   transport: http(),
 * })
 * const wallet = createWalletClient({
 *   chain: mainnetWithEns,
 *   transport: custom(window.ethereum),
 * })
 *
 * const duration = 31536000 // 1 year
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
async function renewNames<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: ClientWithAccount<Transport, TChain, TAccount>,
  {
    nameOrNames,
    duration,
    value,
    containsWrappedNames,
    referrer,
    ...txArgs
  }: RenewNamesParameters<TChain, TAccount, TChainOverride>,
): Promise<RenewNamesReturnType> {
  // If containsWrappedNames is not provided, auto-detect it
  let hasWrappedNames = containsWrappedNames
  if (hasWrappedNames === undefined) {
    const names = Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames]
    hasWrappedNames = await checkContainsWrappedNames(wallet, names)
  }

  const data = makeFunctionData(wallet, {
    nameOrNames,
    duration,
    value,
    containsWrappedNames: hasWrappedNames,
    referrer,
  })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return sendTransaction(wallet, writeArgs)
}

renewNames.makeFunctionData = makeFunctionData

export default renewNames
