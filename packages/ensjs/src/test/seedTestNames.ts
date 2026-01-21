/**
 * Seeds test names for integration tests
 * This script registers the minimal set of names needed for tests to pass
 */

import {
  type Address,
  createPublicClient,
  createWalletClient,
  type Hash,
  http,
  namehash,
  parseEther,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

// Test account from anvil (account #1 with known private key)
const account = privateKeyToAccount(
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
)

const account2 = privateKeyToAccount(
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
)

async function setupClients(l1Url: string) {
  // Get contract addresses from environment
  const addresses = JSON.parse(process.env.DEPLOYMENT_ADDRESSES || '{}')

  const localhost = {
    id: 15658733,
    name: 'Localhost',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: [l1Url] },
    },
    contracts: {
      ensRegistry: { address: addresses.ENSRegistry as Address },
      ensBaseRegistrarImplementation: {
        address: addresses.BaseRegistrarImplementation as Address,
      },
      ensEthRegistrarController: {
        address: addresses.ETHRegistrarController as Address,
      },
      ensNameWrapper: { address: addresses.NameWrapper as Address },
      ensPublicResolver: { address: addresses.PublicResolver as Address },
    },
  }

  const transport = http(l1Url)

  const publicClient = createPublicClient({
    chain: localhost,
    transport,
  })

  const walletClient = createWalletClient({
    account,
    chain: localhost,
    transport,
  })

  return { publicClient, walletClient, addresses, account, account2 }
}

async function registerLegacyName(
  walletClient: any,
  publicClient: any,
  registrarController: Address,
  baseRegistrar: Address,
  label: string,
  owner: Address,
  duration: number = 31536000, // 1 year
): Promise<Hash> {
  const secret =
    '0x0000000000000000000000000000000000000000000000000000000000000000' as Hash

  // Prepare commitment
  const commitment = await publicClient.readContract({
    address: registrarController,
    abi: [
      {
        inputs: [
          { name: 'name', type: 'string' },
          { name: 'owner', type: 'address' },
          { name: 'duration', type: 'uint256' },
          { name: 'secret', type: 'bytes32' },
          { name: 'resolver', type: 'address' },
          { name: 'data', type: 'bytes[]' },
          { name: 'reverseRecord', type: 'bool' },
          { name: 'ownerControlledFuses', type: 'uint16' },
        ],
        name: 'makeCommitment',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'pure',
        type: 'function',
      },
    ] as const,
    functionName: 'makeCommitment',
    args: [label, owner, BigInt(duration), secret, owner, [], false, 0],
  })

  // Commit
  const commitTx = await walletClient.writeContract({
    address: registrarController,
    abi: [
      {
        inputs: [{ name: 'commitment', type: 'bytes32' }],
        name: 'commit',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const,
    functionName: 'commit',
    args: [commitment],
  })

  await waitForTransaction(walletClient, commitTx)

  // Wait for commitment age
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Get rental price
  const price = await publicClient.readContract({
    address: registrarController,
    abi: [
      {
        inputs: [
          { name: 'name', type: 'string' },
          { name: 'duration', type: 'uint256' },
        ],
        name: 'rentPrice',
        outputs: [
          {
            components: [
              { name: 'base', type: 'uint256' },
              { name: 'premium', type: 'uint256' },
            ],
            name: 'price',
            type: 'tuple',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
    functionName: 'rentPrice',
    args: [label, BigInt(duration)],
  })

  const value = price.base + price.premium

  // Register
  const registerTx = await walletClient.writeContract({
    address: registrarController,
    abi: [
      {
        inputs: [
          { name: 'name', type: 'string' },
          { name: 'owner', type: 'address' },
          { name: 'duration', type: 'uint256' },
          { name: 'secret', type: 'bytes32' },
          { name: 'resolver', type: 'address' },
          { name: 'data', type: 'bytes[]' },
          { name: 'reverseRecord', type: 'bool' },
          { name: 'ownerControlledFuses', type: 'uint16' },
        ],
        name: 'register',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ] as const,
    functionName: 'register',
    args: [label, owner, BigInt(duration), secret, owner, [], false, 0],
    value,
  })

  return registerTx
}

async function createSubname(
  walletClient: any,
  registry: Address,
  parentName: string,
  label: string,
  owner: Address,
): Promise<Hash> {
  const parentNode = namehash(parentName)

  const tx = await walletClient.writeContract({
    address: registry,
    abi: [
      {
        inputs: [
          { name: 'node', type: 'bytes32' },
          { name: 'label', type: 'bytes32' },
          { name: 'owner', type: 'address' },
        ],
        name: 'setSubnodeOwner',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const,
    functionName: 'setSubnodeOwner',
    args: [parentNode, namehash(label).slice(0, 66) as Hash, owner],
  })

  return tx
}

async function waitForTransaction(walletClient: any, hash: Hash) {
  let receipt
  for (let i = 0; i < 100; i++) {
    try {
      receipt = await walletClient.getTransactionReceipt({ hash })
      if (receipt) return receipt
    } catch (e) {
      // Not found yet
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`Transaction ${hash} not found after 10 seconds`)
}

export async function seedTestNames(l1Url: string = 'http://localhost:8545') {
  console.log('🌱 Seeding test names...')

  const { walletClient, publicClient, addresses, account2 } = await setupClients(l1Url)

  try {
    // Register "with-subnames.eth"
    console.log('  📝 Registering with-subnames.eth...')
    const tx1 = await registerLegacyName(
      walletClient,
      publicClient,
      addresses.ETHRegistrarController,
      addresses.BaseRegistrarImplementation,
      'with-subnames',
      walletClient.account.address,
    )
    await waitForTransaction(walletClient, tx1)
    console.log('  ✓ Registered with-subnames.eth')

    // Create subname test.with-subnames.eth
    console.log('  📝 Creating test.with-subnames.eth...')
    const tx2 = await createSubname(
      walletClient,
      addresses.ENSRegistry,
      'with-subnames.eth',
      'test',
      account2.address,
    )
    await waitForTransaction(walletClient, tx2)
    console.log('  ✓ Created test.with-subnames.eth')

    // Register "wrapped.eth"
    console.log('  📝 Registering wrapped.eth...')
    const tx3 = await registerLegacyName(
      walletClient,
      publicClient,
      addresses.ETHRegistrarController,
      addresses.BaseRegistrarImplementation,
      'wrapped',
      walletClient.account.address,
    )
    await waitForTransaction(walletClient, tx3)
    console.log('  ✓ Registered wrapped.eth')

    // Register "wrapped-with-subnames.eth"
    console.log('  📝 Registering wrapped-with-subnames.eth...')
    const tx4 = await registerLegacyName(
      walletClient,
      publicClient,
      addresses.ETHRegistrarController,
      addresses.BaseRegistrarImplementation,
      'wrapped-with-subnames',
      walletClient.account.address,
    )
    await waitForTransaction(walletClient, tx4)
    console.log('  ✓ Registered wrapped-with-subnames.eth')

    // Create subname test.wrapped-with-subnames.eth
    console.log('  📝 Creating test.wrapped-with-subnames.eth...')
    const tx5 = await createSubname(
      walletClient,
      addresses.ENSRegistry,
      'wrapped-with-subnames.eth',
      'test',
      account2.address,
    )
    await waitForTransaction(walletClient, tx5)
    console.log('  ✓ Created test.wrapped-with-subnames.eth')

    // Register "wrapped-with-expiring-subnames.eth"
    console.log('  📝 Registering wrapped-with-expiring-subnames.eth...')
    const tx6 = await registerLegacyName(
      walletClient,
      publicClient,
      addresses.ETHRegistrarController,
      addresses.BaseRegistrarImplementation,
      'wrapped-with-expiring-subnames',
      walletClient.account.address,
    )
    await waitForTransaction(walletClient, tx6)
    console.log('  ✓ Registered wrapped-with-expiring-subnames.eth')

    console.log('✅ Test names seeded successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to seed test names:', error)
    throw error
  }
}

// Allow running as standalone script
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestNames()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
