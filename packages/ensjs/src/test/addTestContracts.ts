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
  LegacyENSRegistry: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  ENSRegistry: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  BaseRegistrarImplementation: '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82',
  Root: '0x9A676e781A523b5d0C0e43731313A708CB607508',
  DNSSECImpl: '0x4c5859f0F772848b2D91F1D83E2Fe57935348029',
  DNSRegistrar: '0xc0F115A19107322cFBf1cDBC7ea011C19EbDB4F8',
  ReverseRegistrar: '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F',
  DefaultReverseRegistrar: '0x9E545E3C0baAB3E08CdfD552C960A1050f373042',
  NameWrapper: '0x67d269191c92Caf3cD7723F116c85e6E9bf55933',
  LegacyETHRegistrarController: '0xe1Fd27F4390DcBE165f4D60DBF821e4B9Bb02dEd',
  WrappedETHRegistrarController: '0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690',
  ETHRegistrarController: '0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8',
  StaticBulkRenewal: '0xf5059a5D33d5853360D16C683c16e67980206f36',
  LegacyPublicResolver: '0x66F625B8c4c635af8b74ECe2d7eD0D58b4af3C3d',
  PublicResolver: '0x2E2Ed0Cfd3AD2f1d34481277b3204d807Ca2F8c2',
  UniversalResolver: '0xCace1b78160AE76398F486c8a18044da0d66d86D',
  Multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',

  // ENS v2
  ETHRegistry: '0x922D6956C99E12DFeB3224DEA977D0939758A1Fe',
  RootRegistry: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
  // ENSv1 mirror resolver. Reserved v1 names point at this on v2 so the
  // Universal Resolver can resolve unmigrated v1 names (matches sepolia
  // pre-migration).
  ENSV1Resolver: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  UniversalResolverV2: '0xD5ac451B0c50B9476107823Af206eD814a2e2580',
  UniversalHelper: '0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB',
  ETHRegistrar: '0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d',
  VerifiableFactory: '0x4826533B4897376654Bb4d4AD88B7faFD0C98528',
  PermissionedResolverImpl: '0x21dF544947ba3E8b3c32561399E88B52Dc8b2823',
  UserRegistryImpl: '0x2B0d36FACD61B71CC05ab8F3D2355ec3631C0dd5',
  OwnedResolver: '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1',
  BatchRegistrar: '0x7A9Ec1d04904907De0ED7b6839CcdD59c3716AC9',
  MigrationHelper: '0x74Cf9087AD26D541930BaC724B7ab21bA8F00a27',
  StandardRentPriceOracle: '0x0355B7B8cb128fA5692729Ab3AAa199C1753f726',
  // MockUSDC / MockDAI on the devnet.
  USDC: '0x998abeb3E57409262aE5b751f60747921B33613E',
  DAI: '0x70e0bA845a1A0F2DA3359C97E0285013525FFC49',
  // StandaloneHCAFactory on the devnet.
  HCAFactory: '0xf4B146FbA71F41E0592668ffbF264F1D186b2Ca8',
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
