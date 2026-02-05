import {
  type Account,
  type Address,
  createPublicClient,
  createTestClient,
  createWalletClient,
  type Hash,
  http,
  type PublicClient,
  type TestClient,
  type TransactionReceipt,
  TransactionReceiptNotFoundError,
  type WalletClient,
} from 'viem'
import { localhost as _localhost } from 'viem/chains'
import { ensL2Contracts, supportedL2Chains } from '../clients/l2.js'
import {
  L1_DEVNET_ADDRESSES,
  L2_DEVNET_ADDRESSES,
} from './devnetAddresses.js'

type ContractName =
  | 'BaseRegistrarImplementation'
  | 'ETHRegistrarController'
  | 'Multicall'
  | 'NameWrapper'
  | 'DNSRegistrar'
  | 'PublicResolver'
  | 'ENSRegistry'
  | 'ReverseRegistrar'
  | 'UniversalResolver'
  | 'StaticBulkRenewal'
  | 'DNSSECImpl'
  | 'USDC'
  | 'Root'
  | 'DedicatedResolver'
  | 'UserRegistry'
  | 'V2EthRegistry'
  | 'VerifiableFactory'
  | 'EthRegistrar'

export const deploymentAddresses = {
  ...L1_DEVNET_ADDRESSES,
  ...L2_DEVNET_ADDRESSES,
} as Record<
  | ContractName
  | 'ENSRegistry'
  | 'LegacyPublicResolver'
  | 'NoMulticallResolver'
  | 'OldestResolver',
  Address
>

export const localhost = {
  ..._localhost,
  id: 15658733,
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
    ensL2EthRegistrar: {
      address: deploymentAddresses.ETHRegistrarController,
    },
    ethRegistrar: {
      address: deploymentAddresses.EthRegistrar,
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
      address: deploymentAddresses.StaticBulkRenewal,
    },
    ensDnssecImpl: {
      address: deploymentAddresses.DNSSECImpl,
    },
    usdc: {
      address: deploymentAddresses.USDC,
    },
  },
  subgraphs: {
    ens: {
      url: 'http://localhost:42069/subgraph',
    },
  },
} as const

export const localhostL2 = {
  ..._localhost,
  id: 15658734,
  name: 'Localhost L2',
  contracts: ensL2Contracts[supportedL2Chains.anvilL2],
} as const

const transport = http('http://localhost:8545')

export const publicClient: PublicClient<typeof transport, typeof localhost> =
  createPublicClient({
    chain: localhost,
    transport,
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

const transportL2 = http('http://localhost:8546')

export const publicClientL2: PublicClient<
  typeof transportL2,
  typeof localhostL2
> = createPublicClient({
  chain: localhostL2,
  transport: transportL2,
})

export const testClientL2: TestClient<
  'anvil',
  typeof transportL2,
  typeof localhostL2
> = createTestClient({
  chain: localhostL2,
  transport: transportL2,
  mode: 'anvil',
})

export const walletClientL2: WalletClient<
  typeof transportL2,
  typeof localhostL2,
  Account
> = createWalletClient({
  chain: localhostL2,
  transport: transportL2,
})

export const waitForTransaction = async (hash: Hash) =>
  new Promise<TransactionReceipt>((resolveFn, reject) => {
    publicClient
      .getTransactionReceipt({ hash })
      .then(resolveFn)
      .catch((e) => {
        if (e instanceof TransactionReceiptNotFoundError) {
          setTimeout(() => {
            waitForTransaction(hash).then((receipt) => {
              if (receipt.status !== 'success')
                reject(new Error('transaction unsuccessful'))
              resolveFn(receipt)
            })
          }, 100)
        } else {
          reject(e)
        }
      })
  })
