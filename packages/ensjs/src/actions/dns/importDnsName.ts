import {
  dnsRegistrarProveAndClaimSnippet,
  dnsRegistrarProveAndClaimWithResolverSnippet,
} from '@ensdomains/ensjs-abi/dnsRegistrar'
import {
  type Account,
  type Address,
  type Chain,
  encodeFunctionData,
  type Hash,
  type SendTransactionParameters,
  toHex,
} from 'viem'
import { sendTransaction } from 'viem/actions'
import { packetToBytes } from 'viem/ens'
import { getAction } from 'viem/utils'
import type {
  ChainWithContracts,
  RequireClientContracts,
} from '../../clients/shared.js'
import { getChainContractAddress } from '../../clients/shared.js'
import { AdditionalParameterSpecifiedError } from '../../errors/general.js'
import type {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import type { GetDnsImportDataReturnType } from './getDnsImportData.js'

type BaseImportDnsNameDataParameters = {
  /** Name to import */
  name: string
  /** Data returned from `getDnsImportData()` */
  dnsImportData: GetDnsImportDataReturnType
  /** Address to claim the name for */
  address?: Address
  /** Address of the resolver to use (default: `ensPublicResolver`) */
  resolverAddress?: Address
}

type NoResolverImportDnsNameDataParameters = {
  address?: never
  resolverAddress?: never
}

type ResolverImportDnsNameDataParameters = {
  address: Address
  resolverAddress?: Address
}

export type ImportDnsNameDataParameters = BaseImportDnsNameDataParameters &
  (NoResolverImportDnsNameDataParameters | ResolverImportDnsNameDataParameters)

export type ImportDnsNameDataReturnType = SimpleTransactionRequest

type ImportDnsNameContracts = 'ensDnsRegistrar' | 'ensPublicResolver'

export type ImportDnsNameParameters<
  TChain extends Chain,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithContracts<ImportDnsNameContracts>,
> = Prettify<
  ImportDnsNameDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type ImportDnsNameReturnType = Hash

export type ImportDnsNameErrorType = AdditionalParameterSpecifiedError | Error

export const makeFunctionData = (
  chain: ChainWithContracts<ImportDnsNameContracts>,
  {
    name,
    dnsImportData,
    address,
    resolverAddress,
  }: ImportDnsNameDataParameters,
): ImportDnsNameDataReturnType => {
  const hexEncodedName = toHex(packetToBytes(name))
  const dnsRegistrarAddress = getChainContractAddress({
    chain,
    contract: 'ensDnsRegistrar',
  })

  if (!address) {
    if (resolverAddress)
      throw new AdditionalParameterSpecifiedError({
        parameter: 'resolverAddress',
        allowedParameters: ['name', 'dnsImportData'],
        details:
          'resolverAddress cannot be specified when claiming without an address',
      })
    return {
      to: dnsRegistrarAddress,
      data: encodeFunctionData({
        abi: dnsRegistrarProveAndClaimSnippet,
        functionName: 'proveAndClaim',
        args: [hexEncodedName, dnsImportData],
      }),
    }
  }

  const resolverAddress_ =
    resolverAddress ||
    getChainContractAddress({
      chain,
      contract: 'ensPublicResolver',
    })

  return {
    to: dnsRegistrarAddress,
    data: encodeFunctionData({
      abi: dnsRegistrarProveAndClaimWithResolverSnippet,
      functionName: 'proveAndClaimWithResolver',
      args: [hexEncodedName, dnsImportData, resolverAddress_, address],
    }),
  }
}

/**
 * Creates a transaction to import a DNS name to ENS.
 * @param wallet - {@link ClientWithAccount}
 * @param parameters - {@link ImportDnsNameParameters}
 * @returns A transaction hash. {@link ImportDnsNameReturnType}
 *
 * @example
 * import { createPublicClient, createWalletClient, http, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getDnsImportData, importDnsName } from '@ensdomains/ensjs/dns'
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
 * const dnsImportData = await getDnsImportData(client, {
 *   name: 'example.com',
 * })
 * const hash = await importDnsName(wallet, {
 *   name: 'example.com',
 *   dnsImportData,
 * })
 */
export async function importDnsName<
  TChain extends Chain,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithContracts<ImportDnsNameContracts>,
>(
  wallet: RequireClientContracts<TChain, ImportDnsNameContracts, TAccount>,
  {
    name,
    address,
    dnsImportData,
    resolverAddress,
    ...txArgs
  }: ImportDnsNameParameters<TChain, TAccount, TChainOverride>,
): Promise<ImportDnsNameReturnType> {
  ASSERT_NO_TYPE_ERROR(wallet)
  const data = makeFunctionData(wallet.chain, {
    name,
    address,
    dnsImportData,
    resolverAddress,
  } as ImportDnsNameDataParameters)
  const sendTransactionAction = getAction(
    wallet,
    sendTransaction,
    'sendTransaction',
  )
  return sendTransactionAction({
    ...data,
    ...txArgs,
  } as SendTransactionParameters)
}

importDnsName.makeFunctionData = makeFunctionData
