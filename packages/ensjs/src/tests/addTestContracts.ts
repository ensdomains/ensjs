import { config } from 'dotenv'
import { resolve } from 'path'
import {
  Account,
  Address,
  Hash,
  PublicClient,
  TestClient,
  TransactionReceipt,
  TransactionReceiptNotFoundError,
  WalletClient,
  createPublicClient,
  createTestClient,
  createWalletClient,
  http,
} from 'viem'
import { localhost as _localhost } from 'viem/chains'
import { ContractName } from '../contracts/types'

config({
  path: resolve(__dirname, '../../.env.local'),
  override: true,
})

export const deploymentAddresses = JSON.parse(
  process.env.DEPLOYMENT_ADDRESSES!,
) as Record<
  ContractName | 'ENSRegistry' | 'LegacyPublicResolver' | 'NoMulticallResolver',
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
    ensBulkRenewal: {
      address: deploymentAddresses.BulkRenewal,
    },
  },
  subgraphs: {
    ens: {
      url: 'http://localhost:8000/subgraphs/name/graphprotocol/ens',
    },
  },
} as const

const transport = http('http://localhost:8545')

export const publicClient: PublicClient<
  typeof transport,
  typeof localhost,
  true
> = createPublicClient({
  chain: localhost,
  transport,
})

export const testClient: TestClient<
  'anvil',
  typeof transport,
  typeof localhost,
  true
> = createTestClient({
  chain: localhost,
  transport,
  mode: 'anvil',
})

export const walletClient: WalletClient<
  typeof transport,
  typeof localhost,
  Account,
  true
> = createWalletClient({
  chain: localhost,
  transport,
})

export const waitForTransaction = async (hash: Hash) =>
  new Promise<TransactionReceipt>((resolveFn, reject) => {
    publicClient
      .getTransactionReceipt({ hash })
      .then(resolveFn)
      .catch((e) => {
        if (e instanceof TransactionReceiptNotFoundError) {
          setTimeout(() => {
            waitForTransaction(hash).then(resolveFn)
          }, 100)
        } else {
          reject(e)
        }
      })
  })
