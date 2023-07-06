import {
  bytesToHex,
  encodeFunctionData,
  toHex,
  type Account,
  type Address,
  type Hash,
  type SendTransactionParameters,
  type Transport,
} from 'viem'
import type { ChainWithEns, WalletWithEns } from '../../contracts/consts.js'
import {
  dnsRegistrarProveAndClaimSnippet,
  dnsRegistrarProveAndClaimWithResolverSnippet,
} from '../../contracts/dnsRegistrar.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { AdditionalParameterSpecifiedError } from '../../errors/general.js'
import type {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types.js'
import { packetToBytes } from '../../utils/hexEncodedName.js'
import type { PrepareDnsImportReturnType } from './prepareDnsImport.js'

type BaseImportDnsNameDataParameters = {
  /** Name to import */
  name: string
  /** Data returned from `prepareDnsImport()` */
  preparedData: PrepareDnsImportReturnType
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

export type ImportDnsNameParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  ImportDnsNameDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type ImportDnsNameReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  { name, preparedData, address, resolverAddress }: ImportDnsNameDataParameters,
): ImportDnsNameDataReturnType => {
  const data = preparedData.rrsets.map((rrset) => ({
    rrset: bytesToHex(rrset.rrset),
    sig: bytesToHex(rrset.sig),
  }))
  const hexEncodedName = toHex(packetToBytes(name))
  const dnsRegistrarAddress = getChainContractAddress({
    client: wallet,
    contract: 'ensDnsRegistrar',
  })

  if (!address) {
    if (resolverAddress)
      throw new AdditionalParameterSpecifiedError({
        parameter: 'resolverAddress',
        allowedParameters: ['name', 'preparedData'],
        details:
          'resolverAddress cannot be specified when claiming without an address',
      })
    return {
      to: dnsRegistrarAddress,
      data: encodeFunctionData({
        abi: dnsRegistrarProveAndClaimSnippet,
        functionName: 'proveAndClaim',
        args: [hexEncodedName, data, bytesToHex(preparedData.proof)],
      }),
    }
  }

  const resolverAddress_ =
    resolverAddress ||
    getChainContractAddress({ client: wallet, contract: 'ensPublicResolver' })

  return {
    to: dnsRegistrarAddress,
    data: encodeFunctionData({
      abi: dnsRegistrarProveAndClaimWithResolverSnippet,
      functionName: 'proveAndClaimWithResolver',
      args: [
        hexEncodedName,
        data,
        bytesToHex(preparedData.proof),
        resolverAddress_,
        address,
      ],
    }),
  }
}

/**
 * Creates a transaction to import a DNS name to ENS.
 * @param wallet - {@link WalletWithEns}
 * @param parameters - {@link ImportDnsNameParameters}
 * @returns A transaction hash. {@link ImportDnsNameReturnType}
 *
 * @example
 * import { createPublicClient, createWalletClient, http, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addContracts, prepareDnsImport, importDnsName } from '@ensdomains/ensjs'
 *
 * const [mainnetWithEns] = addContracts([mainnet])
 * const client = createPublicClient({
 *   chain: mainnetWithEns,
 *   transport: http(),
 * })
 * const wallet = createWalletClient({
 *   chain: mainnetWithEns,
 *   transport: custom(window.ethereum),
 * })
 * const preparedData = await prepareDnsImport(client, {
 *   name: 'example.com',
 * })
 * const hash = await importDnsName(client, {
 *   name: 'example.com',
 *   preparedData,
 * })
 */
async function importDnsName<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    address,
    preparedData,
    resolverAddress,
    ...txArgs
  }: ImportDnsNameParameters<TChain, TAccount, TChainOverride>,
): Promise<ImportDnsNameReturnType> {
  const data = makeFunctionData(wallet, {
    name,
    address,
    preparedData,
    resolverAddress,
  } as ImportDnsNameDataParameters)
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

importDnsName.makeFunctionData = makeFunctionData

export default importDnsName
