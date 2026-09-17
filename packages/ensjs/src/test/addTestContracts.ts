import { proxyDeployedEventSnippet } from '@ensdomains/ensjs-abi/v2/verifiableFactory'
import {
  type Account,
  type Address,
  createPublicClient,
  createTestClient,
  createWalletClient,
  type Hash,
  http,
  isAddressEqual,
  type PublicClient,
  parseEventLogs,
  type TestClient,
  type TransactionReceipt,
  TransactionReceiptNotFoundError,
  type WalletClient,
} from 'viem'
import { localhost as _localhost } from 'viem/chains'

/**
 * Devnet contract addresses, as served by the devnet at
 * `http://localhost:8000/deployments` for the image pinned in compose.yml.
 */
export const deploymentAddresses = {
  // ENS v1
  LegacyENSRegistry: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  ENSRegistry: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  BaseRegistrarImplementation: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
  Root: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
  DNSSECImpl: '0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00',
  DNSRegistrar: '0x18E317A7D70d8fBf8e6E893616b52390EbBdb629',
  ReverseRegistrar: '0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f',
  DefaultReverseRegistrar: '0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690',
  NameWrapper: '0x09635F643e140090A9A8Dcd712eD6285858ceBef',
  LegacyETHRegistrarController: '0x986aaa537b8cc170761FDAC6aC4fc7F9d8a20A8C',
  WrappedETHRegistrarController: '0x67d269191c92Caf3cD7723F116c85e6E9bf55933',
  ETHRegistrarController: '0x9E545E3C0baAB3E08CdfD552C960A1050f373042',
  StaticBulkRenewal: '0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8',
  LegacyPublicResolver: '0xD49a0e9A4CD5979aE36840f542D2d7f02C4817Be',
  PublicResolver: '0xdbC43Ba45381e02825b14322cDdd15eC4B3164E6',
  UniversalResolver: '0xe8D2A1E88c91DCd5433208d4152Cc4F399a7e91d',
  Multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',

  // ENS v2
  ETHRegistry: '0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f',
  RootRegistry: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
  // ENSv1 mirror resolver. Reserved v1 names point at this on v2 so the
  // Universal Resolver can resolve unmigrated v1 names (matches sepolia
  // pre-migration).
  ENSV1Resolver: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  UniversalResolverV2: '0x5067457698Fd6Fa1C6964e416b3f42713513B3dD',
  UniversalHelper: '0x51A1ceB83B83F1985a81C295d1fF28Afef186E02',
  ETHRegistrar: '0x4EE6eCAD1c2Dae9f525404De8555724e3c35d07B',
  VerifiableFactory: '0x998abeb3E57409262aE5b751f60747921B33613E',
  PermissionedResolverImpl: '0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d',
  UserRegistryImpl: '0x36b58F5C1969B7b6591D752ea6F5486D069010AB',
  OwnedResolver: '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d',
  BatchRegistrar: '0xC9a43158891282A2B1475592D5719c001986Aaec',
  MigrationHelper: '0xc582Bc0317dbb0908203541971a358c44b1F3766',
  StandardRentPriceOracle: '0xDC11f7E700A4c898AE5CAddB1082cFfa76512aDD',
  // MockUSDC / MockDAI on the devnet.
  USDC: '0xf5059a5D33d5853360D16C683c16e67980206f36',
  DAI: '0x95401dc811bb5740090279Ba06cfA8fcF6113778',
  // StandaloneHCAFactory on the devnet.
  HCAFactory: '0x8198f5d8F8CfFE8f9C413d98a0A55aEB8ab9FbB7',
} as const

export const localhost = {
  ..._localhost,
  id: 31337,
  contracts: {
    // v1
    ensLegacyRegistry: {
      address: deploymentAddresses.ENSRegistry,
    },
    ensRegistry: {
      address: deploymentAddresses.ENSRegistry,
    },
    ensUniversalResolver: {
      // On real networks this is the UpgradableUniversalResolverProxy, which
      // fronts UniversalResolverV2. A local devnet deploys no top proxy (every
      // universalResolver deploy step returns early on `tags.local`), so point
      // at UniversalResolverV2 itself, as the devnet's own setup does. It
      // resolves both v1 and v2 names.
      address: deploymentAddresses.UniversalResolverV2,
    },
    ensUniversalHelper: {
      // The registry-walking views (findExactOwner / findRegistries /
      // findParentRegistry), split out of the UR.
      address: deploymentAddresses.UniversalHelper,
    },
    multicall3: {
      address: deploymentAddresses.Multicall,
    },
    ensBaseRegistrarImplementation: {
      address: deploymentAddresses.BaseRegistrarImplementation,
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
    ensLegacyDnsRegistrar: {
      address: deploymentAddresses.DNSRegistrar,
    },
    ensLegacyDnssecImpl: {
      address: deploymentAddresses.DNSSECImpl,
    },
    ensEthRegistrar: {
      address: deploymentAddresses.ETHRegistrar,
    },
    ensEthRenewerV1: {
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
    ensStandardRentPriceOracle: {
      address: deploymentAddresses.StandardRentPriceOracle,
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

/**
 * Polls until the transaction is mined, and throws if it reverted.
 *
 * The devnet mines asynchronously, so a receipt is rarely there on the first
 * read. A flat loop keeps a revert found on any attempt a rejection; the
 * earlier recursive version dropped it past the first retry and hung instead.
 */
export const waitForTransaction = async (
  hash: Hash,
): Promise<TransactionReceipt> => {
  for (;;) {
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash })
      if (receipt.status !== 'success')
        throw new Error('transaction unsuccessful')
      return receipt
    } catch (e) {
      if (!(e instanceof TransactionReceiptNotFoundError)) throw e
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
}

/**
 * The proxy a `VerifiableFactory.deployProxy` transaction created, read from
 * the factory's `ProxyDeployed` event rather than a fixed log index, which
 * shifts with whatever the proxy's initializer emits.
 */
export const getDeployedProxyAddress = (
  receipt: TransactionReceipt,
): Address => {
  const [deployed] = parseEventLogs({
    abi: proxyDeployedEventSnippet,
    eventName: 'ProxyDeployed',
    logs: receipt.logs.filter((log) =>
      isAddressEqual(log.address, deploymentAddresses.VerifiableFactory),
    ),
  })
  if (!deployed) throw new Error('no ProxyDeployed event in receipt')
  return deployed.args.proxyAddress
}
