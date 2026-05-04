import {
  type Account,
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

/**
 * Devnet contract addresses.
 * Parsed from: docker logs ens-test-env-devnet-1
 */
export const deploymentAddresses = {
  // ENS v1
  LegacyENSRegistry: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  ENSRegistry: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  BaseRegistrarImplementation: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
  Root: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
  DNSSECImpl: '0x67d269191c92Caf3cD7723F116c85e6E9bf55933',
  DNSRegistrar: '0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB',
  ReverseRegistrar: '0x162A433068F51e18b7d13932F27e66a3f99E6890',
  DefaultReverseRegistrar: '0x4c5859f0F772848b2D91F1D83E2Fe57935348029',
  NameWrapper: '0x5081a39b8A5f0E35a8D959395a630b68B74Dd30f',
  LegacyETHRegistrarController: '0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d',
  WrappedETHRegistrarController: '0x253553366Da8546fC250F225fe3d25d0C782303b',
  ETHRegistrarController: '0x1c85638e118b37167e9298c2268758e058DdfDA0',
  StaticBulkRenewal: '0x4C2F7092C2aE51D986bEFEe378e50BD4dB99C901',
  LegacyPublicResolver: '0x86A2EE8FAf9A840F7a2c64CA3d51209F9A02081D',
  PublicResolver: '0xA4899D35897033b927acFCf422bc745916139776',
  UniversalResolver: '0x5067457698Fd6Fa1C6964e416b3f42713513B3dD',
  Multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',

  // ENS v2
  ETHRegistry: '0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf',
  RootRegistry: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  UniversalResolverV2: '0x0355B7B8cb128fA5692729Ab3AAa199C1753f726',
  ETHRegistrar: '0x4C4a2f8c81640e47606d3fd77B353E87Ba015584',
  VerifiableFactory: '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1',
  PermissionedResolverImpl: '0x809d550fca64d94Bd9F66E60752A544199cfAC3D',
  UserRegistryImpl: '0x7969c5eD335650692Bc04293B07F5BF2e7A673C0',
  OwnedResolver: '0x68B1D87F95878fE05B998F19b66F4baba5De1aed',
  BatchRegistrar: '0xD8a5a9b31c3C0232E196d518E89Fd8bF83AcAd43',
  MigrationHelper: '0x18E317A7D70d8fBf8e6E893616b52390EbBdb629',
  USDC: '0xFD471836031dc5108809D173A067e8486B9047A3',
} as const

export const localhost = {
  ..._localhost,
  id: 1,
  contracts: {
    // v1
    ensLegacyRegistry: {
      address: deploymentAddresses.ENSRegistry,
    },
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
      address: deploymentAddresses.StaticBulkRenewal,
    },
    ensDnssecImpl: {
      address: deploymentAddresses.DNSSECImpl,
    },
    ensLegacyDnsRegistrar: {
      address: deploymentAddresses.DNSRegistrar,
    },
    ensLegacyDnssecImpl: {
      address: deploymentAddresses.DNSSECImpl,
    },
    ensEthRegistrar: {
      address: deploymentAddresses.ETHRegistrar,
    },
    ensDefaultReverseRegistrar: {
      address: deploymentAddresses.DefaultReverseRegistrar,
    },
    legacyEthRegistrarController: {
      address: deploymentAddresses.LegacyETHRegistrarController,
    },
    legacyPublicResolver: {
      address: deploymentAddresses.LegacyPublicResolver,
    },

    // v2
    ethRegistrar: {
      address: deploymentAddresses.ETHRegistrar,
    },
    usdc: {
      address: deploymentAddresses.USDC,
    },
    ensVerifiableFactory: {
      address: deploymentAddresses.VerifiableFactory,
    },
    ensPermissionedResolverImpl: {
      address: deploymentAddresses.PermissionedResolverImpl,
    },
    ensUserRegistryImpl: {
      address: deploymentAddresses.UserRegistryImpl,
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
