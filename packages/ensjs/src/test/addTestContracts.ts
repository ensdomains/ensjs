import { resolve } from 'node:path'
import { config } from 'dotenv'
import {
  http,
  type Account,
  type Address,
  type Hash,
  type PublicClient,
  type TestClient,
  type TransactionReceipt,
  TransactionReceiptNotFoundError,
  type WalletClient,
  createPublicClient,
  createTestClient,
  createWalletClient,
} from 'viem'
import { localhost as _localhost } from 'viem/chains'

config({
  path: resolve(import.meta.dirname, '../../.env.local'),
  override: true,
})

type ContractName =
  | 'BaseRegistrarImplementation'
  | 'ETHRegistrarController'
  | 'Multicall'
  | 'NameWrapper'
  | 'DNSRegistrar'
  | 'PublicResolver'
  | 'ENSRegistry'
  | 'ReverseRegistrar'
  | 'DefaultReverseRegistrar'
  | 'UniversalResolver'
  | 'StaticBulkRenewal'
  | 'WrappedStaticBulkRenewal'
  | 'DNSSECImpl'
  | 'Root'
  | 'WrappedEthRegistrarController'
  | 'WrappedPublicResolver'
  | 'LegacyETHRegistrarController'
  | 'LegacyPublicResolver'

export const deploymentAddresses = JSON.parse(
  process.env.DEPLOYMENT_ADDRESSES!,
) as Record<
  | ContractName
  | 'ENSRegistry'
  | 'LegacyPublicResolver'
  | 'NoMulticallResolver'
  | 'OldestResolver',
  Address
>

export const localhost = {
  ..._localhost,
  contracts: {
    ensRegistry: {
      address: deploymentAddresses.ENSRegistry,
    },
    ensUniversalResolver: {
      address: deploymentAddresses.UniversalResolver,
    },
    multicall3: {
      address: deploymentAddresses.Multicall,
    },
    ensBaseRegistrarImplementation: {
      address: deploymentAddresses.BaseRegistrarImplementation,
    },
    ensDnsRegistrar: {
      address: deploymentAddresses.DNSRegistrar,
    },
    ensEthRegistrarController: {
      address: deploymentAddresses.ETHRegistrarController,
    },
    ensNameWrapper: {
      address: deploymentAddresses.NameWrapper,
    },
    ensPublicResolver: {
      address: deploymentAddresses.PublicResolver,
    },
    ensReverseRegistrar: {
      address: deploymentAddresses.ReverseRegistrar,
    },
    ensDefaultReverseRegistrar: {
      address: deploymentAddresses.DefaultReverseRegistrar,
    },
    ensBulkRenewal: {
      address: deploymentAddresses.StaticBulkRenewal,
    },
    ensDnssecImpl: {
      address: deploymentAddresses.DNSSECImpl,
    },
    wrappedEthRegistrarController: {
      address: deploymentAddresses.WrappedEthRegistrarController,
    },
    wrappedPublicResolver: {
      address: deploymentAddresses.WrappedPublicResolver,
    },
    wrappedBulkRenewal: {
      address: deploymentAddresses.WrappedStaticBulkRenewal,
    },
    legacyEthRegistrarController: {
      address: deploymentAddresses.LegacyETHRegistrarController,
    },
    legacyPublicResolver: {
      address: deploymentAddresses.LegacyPublicResolver,
    },
  },
  subgraphs: {
    ens: {
      url: 'http://localhost:42069/subgraph',
    },
  },
} as const

const transport = http('http://localhost:8545')

export const publicClient: PublicClient<typeof transport, typeof localhost> =
  createPublicClient({
    chain: localhost,
    transport,
    cacheTime: 0,
  })

export const testClient: TestClient<
  'anvil',
  typeof transport,
  typeof localhost
> = createTestClient({
  chain: localhost,
  transport,
  mode: 'anvil',
})

export const walletClient: WalletClient<
  typeof transport,
  typeof localhost,
  Account
> = createWalletClient({
  chain: localhost,
  transport,
})

export const waitForTransaction = async (
  hash: Hash,
): Promise<TransactionReceipt> => {
  const receipt = await publicClient
    .getTransactionReceipt({ hash })
    .catch((e) => {
      if (e instanceof TransactionReceiptNotFoundError) return null
      throw e
    })
  if (receipt === null) {
    return new Promise<TransactionReceipt>((resolve, reject) => {
      setTimeout(() => {
        waitForTransaction(hash).then(resolve).catch(reject)
      }, 100)
    })
  }

  if (receipt.status !== 'success') throw new Error('Transaction failed')
  return receipt
}
