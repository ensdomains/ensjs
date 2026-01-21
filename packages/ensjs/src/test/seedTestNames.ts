/**
 * Seeds test names for integration tests
 * This script registers the minimal set of names needed for tests to pass
 */

import {
  type Address,
  createPublicClient,
  createWalletClient,
  getAddress,
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

// Real devnet addresses from namechain
const DEVNET_ADDRESSES = {
  ENSRegistry: getAddress('0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82'),
  BaseRegistrarImplementation: getAddress('0x851356ae760d987E095750cCeb3bC6014560891C'),
  LegacyETHRegistrarController: getAddress('0x172076E0166D1F9Cc711C77Adf8488051744980C'),
  WrappedETHRegistrarController: getAddress('0x253553366Da8546fC250F225fe3d25d0C782303b'),
  NameWrapper: getAddress('0x162A433068F51e18b7d13932F27e66a3f99E6890'),
  PublicResolver: getAddress('0x4C2F7092C2aE51D986bEFEe378e50BD4dB99C901'),
  LegacyPublicResolver: getAddress('0x367761085BF3C12e5DA2Df99AC6E1a824612b8fb'),
}

async function setupClients(l1Url: string) {
  const localhost = {
    id: 15658733,
    name: 'Localhost',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: [l1Url] },
    },
    contracts: {
      ensRegistry: { address: DEVNET_ADDRESSES.ENSRegistry },
      ensBaseRegistrarImplementation: {
        address: DEVNET_ADDRESSES.BaseRegistrarImplementation,
      },
      ensEthRegistrarController: {
        address: DEVNET_ADDRESSES.LegacyETHRegistrarController,
      },
      ensNameWrapper: { address: DEVNET_ADDRESSES.NameWrapper },
      ensPublicResolver: { address: DEVNET_ADDRESSES.PublicResolver },
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

  return { publicClient, walletClient, addresses: DEVNET_ADDRESSES, account, account2 }
}

async function registerLegacyName(
  walletClient: any,
  publicClient: any,
  registrarController: Address,
  resolver: Address,
  label: string,
  owner: Address,
  duration: number = 31536000, // 1 year
): Promise<Hash> {
  const secret =
    '0x0000000000000000000000000000000000000000000000000000000000000000' as Hash

  // Check if name is available
  const available = await publicClient.readContract({
    address: registrarController,
    abi: [
      {
        inputs: [{ name: 'name', type: 'string' }],
        name: 'available',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
    functionName: 'available',
    args: [label],
  })

  if (!available) {
    throw new Error(`Name ${label}.eth is not available`)
  }

  // Prepare commitment using legacy makeCommitmentWithConfig
  const commitment = await publicClient.readContract({
    address: registrarController,
    abi: [
      {
        inputs: [
          { name: 'name', type: 'string' },
          { name: 'owner', type: 'address' },
          { name: 'secret', type: 'bytes32' },
          { name: 'resolver', type: 'address' },
          { name: 'addr', type: 'address' },
        ],
        name: 'makeCommitmentWithConfig',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'pure',
        type: 'function',
      },
    ] as const,
    functionName: 'makeCommitmentWithConfig',
    args: [label, owner, secret, resolver, owner],
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

  await waitForTransaction(publicClient, commitTx)

  // Wait for commitment age (min wait time) and mine several blocks
  await new Promise((resolve) => setTimeout(resolve, 500))
  for (let i = 0; i < 10; i++) {
    await mineBlock() // Mine blocks to pass minimum commitment age
  }

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
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
    functionName: 'rentPrice',
    args: [label, BigInt(duration)],
  })

  console.log(`  Price for ${label}.eth: ${price} wei`)

  // Register using legacy registerWithConfig
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
          { name: 'addr', type: 'address' },
        ],
        name: 'registerWithConfig',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ] as const,
    functionName: 'registerWithConfig',
    args: [label, owner, BigInt(duration), secret, resolver, owner],
    value: price,
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

async function mineBlock() {
  await fetch('http://localhost:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'evm_mine',
      params: [],
      id: 1,
    }),
  })
}

async function waitForTransaction(publicClient: any, hash: Hash) {
  // Mine a block to include the transaction
  await mineBlock()

  let receipt
  for (let i = 0; i < 20; i++) {
    try {
      receipt = await publicClient.getTransactionReceipt({ hash })
      if (receipt) return receipt
    } catch (e) {
      // Not found yet
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`Transaction ${hash} not found after 4 seconds`)
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
      addresses.LegacyETHRegistrarController,
      addresses.LegacyPublicResolver,
      'with-subnames',
      walletClient.account.address,
    )
    await waitForTransaction(publicClient, tx1)
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
    await waitForTransaction(publicClient, tx2)
    console.log('  ✓ Created test.with-subnames.eth')

    // Register "wrapped.eth"
    console.log('  📝 Registering wrapped.eth...')
    const tx3 = await registerLegacyName(
      walletClient,
      publicClient,
      addresses.LegacyETHRegistrarController,
      addresses.LegacyPublicResolver,
      'wrapped',
      walletClient.account.address,
    )
    await waitForTransaction(publicClient, tx3)
    console.log('  ✓ Registered wrapped.eth')

    // Register "wrapped-with-subnames.eth"
    console.log('  📝 Registering wrapped-with-subnames.eth...')
    const tx4 = await registerLegacyName(
      walletClient,
      publicClient,
      addresses.LegacyETHRegistrarController,
      addresses.LegacyPublicResolver,
      'wrapped-with-subnames',
      walletClient.account.address,
    )
    await waitForTransaction(publicClient, tx4)
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
    await waitForTransaction(publicClient, tx5)
    console.log('  ✓ Created test.wrapped-with-subnames.eth')

    // Register "wrapped-with-expiring-subnames.eth"
    console.log('  📝 Registering wrapped-with-expiring-subnames.eth...')
    const tx6 = await registerLegacyName(
      walletClient,
      publicClient,
      addresses.LegacyETHRegistrarController,
      addresses.LegacyPublicResolver,
      'wrapped-with-expiring-subnames',
      walletClient.account.address,
    )
    await waitForTransaction(publicClient, tx6)
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
