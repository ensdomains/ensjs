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
  LegacyENSRegistry: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  ENSRegistry: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  BaseRegistrarImplementation: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
  Root: '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82',
  DNSSECImpl: '0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9',
  DNSRegistrar: '0x7A9Ec1d04904907De0ED7b6839CcdD59c3716AC9',
  ReverseRegistrar: '0x82e01223d51Eb87e16A03E24687EDF0F294da6f1',
  DefaultReverseRegistrar: '0xB0D4afd8879eD9F52b28595d31B441D079B2Ca07',
  NameWrapper: '0x7969c5eD335650692Bc04293B07F5BF2e7A673C0',
  LegacyETHRegistrarController: '0xf953b3A269d80e3eB0F2947630Da976B896A8C5b',
  WrappedETHRegistrarController: '0x253553366Da8546fC250F225fe3d25d0C782303b',
  ETHRegistrarController: '0x922D6956C99E12DFeB3224DEA977D0939758A1Fe',
  StaticBulkRenewal: '0xAA292E8611aDF267e563f334Ee42320aC96D0463',
  LegacyPublicResolver: '0x5067457698Fd6Fa1C6964e416b3f42713513B3dD',
  PublicResolver: '0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d',
  UniversalResolver: '0x4b6aB5F819A515382B0dEB6935D793817bB4af28',
  Multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',

  // ENS v2
  ETHRegistry: '0x4c5859f0F772848b2D91F1D83E2Fe57935348029',
  RootRegistry: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
  // ENSv1 mirror resolver. Reserved v1 names point at this on v2 so the
  // Universal Resolver can resolve unmigrated v1 names (matches sepolia
  // pre-migration).
  ENSV1Resolver: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  UniversalResolverV2: '0x367761085BF3C12e5DA2Df99AC6E1a824612b8fb',
  UpgradableUniversalResolverProxy:
    '0x4C2F7092C2aE51D986bEFEe378e50BD4dB99C901',
  ETHRegistrar: '0x0355B7B8cb128fA5692729Ab3AAa199C1753f726',
  VerifiableFactory: '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F',
  PermissionedResolverImpl: '0xFD471836031dc5108809D173A067e8486B9047A3',
  UserRegistryImpl: '0x2E2Ed0Cfd3AD2f1d34481277b3204d807Ca2F8c2',
  OwnedResolver: '0x59b670e9fA9D0A427751Af201D676719a970857b',
  BatchRegistrar: '0x2B0d36FACD61B71CC05ab8F3D2355ec3631C0dd5',
  MigrationHelper: '0xCace1b78160AE76398F486c8a18044da0d66d86D',
  StandardRentPriceOracle: '0x21dF544947ba3E8b3c32561399E88B52Dc8b2823',
  USDC: '0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f',
  DAI: '0xe915cebbc1570a74177b6c589fed1e8f53117559',
  HCAFactory: '0x358680728dedb552adaa9f5eb5d4395b291cf943',
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
      // The devnet's Universal Resolver is the UpgradableUniversalResolverProxy,
      // which fronts UniversalResolverV2. It resolves both v1 and v2 names and
      // exposes the v2-only methods (e.g. findParentRegistry) that the bare v1
      // UniversalResolver lacks.
      address: deploymentAddresses.UpgradableUniversalResolverProxy,
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
