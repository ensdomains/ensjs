/**
 * Seeds test names for integration tests
 * This script registers the minimal set of names needed for tests to pass
 */

import { cborEncode } from '@ensdomains/address-encoder/utils'
import pako from 'pako'
import {
  type Address,
  bytesToHex,
  createPublicClient,
  createWalletClient,
  type Hash,
  http,
  keccak256,
  namehash,
  type PublicClient,
  stringToHex,
  toHex,
  type WalletClient,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { L1_DEVNET_ADDRESSES, L2_DEVNET_ADDRESSES } from './devnetAddresses.js'

// Test account from anvil (account #1 with known private key)
const account = privateKeyToAccount(
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
)

// Anvil account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
const account2 = privateKeyToAccount(
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
)

async function setupClients(l1Url: string, l2Url = 'http://localhost:8546') {
  const localhost = {
    id: 15658733,
    name: 'Localhost',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: [l1Url] },
    },
    contracts: {
      ensRegistry: { address: L1_DEVNET_ADDRESSES.ENSRegistry },
      ensBaseRegistrarImplementation: {
        address: L1_DEVNET_ADDRESSES.BaseRegistrarImplementation,
      },
      ensEthRegistrarController: {
        address: L1_DEVNET_ADDRESSES.LegacyETHRegistrarController,
      },
      ensNameWrapper: { address: L1_DEVNET_ADDRESSES.NameWrapper },
      ensPublicResolver: { address: L1_DEVNET_ADDRESSES.PublicResolver },
    },
  }

  const localhostL2 = {
    id: 15658734,
    name: 'Localhost L2',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: [l2Url] },
    },
    contracts: {
      ethRegistrar: { address: L2_DEVNET_ADDRESSES.EthRegistrar },
      usdc: { address: L2_DEVNET_ADDRESSES.USDC },
    },
  }

  const transport = http(l1Url)
  const transportL2 = http(l2Url)

  const publicClient = createPublicClient({
    chain: localhost,
    transport,
  })

  const publicClientL2 = createPublicClient({
    chain: localhostL2,
    transport: transportL2,
  })

  const walletClient = createWalletClient({
    account,
    chain: localhost,
    transport,
  })

  const walletClient2 = createWalletClient({
    account: account2,
    chain: localhost,
    transport,
  })

  const walletClientL2 = createWalletClient({
    account,
    chain: localhostL2,
    transport: transportL2,
  })

  return {
    publicClient,
    publicClientL2,
    walletClient,
    walletClient2,
    walletClientL2,
    addresses: L1_DEVNET_ADDRESSES,
    l2Addresses: L2_DEVNET_ADDRESSES,
    account,
    account2,
  }
}

// Register names using LegacyETHRegistrarController (unwrapped names)
// Note: This may cause ensindexer to crash but unit tests don't need it
async function registerUnwrappedName(
  walletClient: WalletClient,
  publicClient: PublicClient,
  registrarController: Address,
  resolver: Address,
  label: string,
  owner: Address,
  duration = 31536000, // 1 year
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
    console.log(`  ⏭️ Name ${label}.eth already registered, skipping`)
    return '0x0' as Hash // Return dummy hash to indicate skip
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

  // Wait for commitment age (min wait time) by advancing blockchain time
  await increaseTime(120)

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

  console.log(`  Price for ${label}.eth (unwrapped): ${price} wei`)

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

// Register names using ETHRegistrarController (wrapped names)
// The devnet ETHRegistrarController uses a tuple-based interface:
//   makeCommitment((string,address,uint256,bytes32,address,bytes[],uint8,bytes32))
//   register((string,address,uint256,bytes32,address,bytes[],uint8,bytes32))
const registrationParamsTuple = {
  name: 'params',
  type: 'tuple',
  components: [
    { name: 'name', type: 'string' },
    { name: 'owner', type: 'address' },
    { name: 'duration', type: 'uint256' },
    { name: 'secret', type: 'bytes32' },
    { name: 'resolver', type: 'address' },
    { name: 'data', type: 'bytes[]' },
    { name: 'ownerControlledFuses', type: 'uint8' },
    { name: 'referralCode', type: 'bytes32' },
  ],
} as const

const ZERO_BYTES32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`

async function registerWrappedName(
  walletClient: WalletClient,
  publicClient: PublicClient,
  registrarController: Address,
  resolver: Address,
  label: string,
  owner: Address,
  baseRegistrar: Address,
  nameWrapper: Address,
  duration = 31536000, // 1 year
): Promise<Hash> {
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
    console.log(`  ⏭️ Name ${label}.eth already registered, skipping`)
    return '0x0' as Hash // Return dummy hash to indicate skip
  }

  const params = {
    name: label,
    owner,
    duration: BigInt(duration),
    secret: ZERO_BYTES32,
    resolver,
    data: [] as `0x${string}`[],
    ownerControlledFuses: 0,
    referralCode: ZERO_BYTES32,
  }

  // Prepare commitment
  const commitment = await publicClient.readContract({
    address: registrarController,
    abi: [
      {
        inputs: [registrationParamsTuple],
        name: 'makeCommitment',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'pure',
        type: 'function',
      },
    ] as const,
    functionName: 'makeCommitment',
    args: [params],
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

  // Wait for commitment age by advancing blockchain time
  await increaseTime(120)

  // Get rental price
  const [base, premium] = await publicClient.readContract({
    address: registrarController,
    abi: [
      {
        inputs: [
          { name: 'name', type: 'string' },
          { name: 'duration', type: 'uint256' },
        ],
        name: 'rentPrice',
        outputs: [
          { name: 'base', type: 'uint256' },
          { name: 'premium', type: 'uint256' },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
    functionName: 'rentPrice',
    args: [label, BigInt(duration)],
  })

  const price = base + premium
  console.log(`  Price for ${label}.eth: ${price} wei`)

  // Register
  const registerTx = await walletClient.writeContract({
    address: registrarController,
    abi: [
      {
        inputs: [registrationParamsTuple],
        name: 'register',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ] as const,
    functionName: 'register',
    args: [params],
    value: price,
  })

  await waitForTransaction(publicClient, registerTx)

  // The devnet ETHRegistrarController does not auto-wrap, so we wrap manually
  // 1. Approve NameWrapper to manage BaseRegistrar tokens
  const approveTx = await approveNameWrapper(
    walletClient,
    baseRegistrar,
    nameWrapper,
  )
  await waitForTransaction(publicClient, approveTx)

  // 2. Wrap the name via NameWrapper.wrapETH2LD
  const wrapTx = await wrapETH2LD(
    walletClient,
    nameWrapper,
    label,
    owner,
    resolver,
  )

  return wrapTx
}

async function createSubname(
  walletClient: any,
  registry: Address,
  parentName: string,
  label: string,
  owner: Address,
): Promise<Hash> {
  const parentNode = namehash(parentName)
  // labelhash is keccak256 of the label string (not namehash)
  const labelHash = keccak256(toHex(label))

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
    args: [parentNode, labelHash, owner],
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

async function increaseTime(seconds: number) {
  await fetch('http://localhost:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [seconds],
      id: 1,
    }),
  })
  await mineBlock() // Mine a block to apply the time change
}

async function setPrimaryName(
  walletClient: WalletClient,
  reverseRegistrar: Address,
  name: string,
): Promise<Hash> {
  const tx = await walletClient.writeContract({
    address: reverseRegistrar,
    abi: [
      {
        inputs: [{ name: 'name', type: 'string' }],
        name: 'setName',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const,
    functionName: 'setName',
    args: [name],
  })
  return tx
}

async function setAddrRecord(
  walletClient: WalletClient,
  resolver: Address,
  name: string,
  addr: Address,
): Promise<Hash> {
  const node = namehash(name)
  const tx = await walletClient.writeContract({
    address: resolver,
    abi: [
      {
        inputs: [
          { name: 'node', type: 'bytes32' },
          { name: 'a', type: 'address' },
        ],
        name: 'setAddr',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const,
    functionName: 'setAddr',
    args: [node, addr],
  })
  return tx
}

async function setAddrRecordWithCoin(
  walletClient: WalletClient,
  resolver: Address,
  name: string,
  coinType: bigint,
  addrBytes: `0x${string}`,
): Promise<Hash> {
  const node = namehash(name)
  const tx = await walletClient.writeContract({
    address: resolver,
    abi: [
      {
        inputs: [
          { name: 'node', type: 'bytes32' },
          { name: 'coinType', type: 'uint256' },
          { name: 'a', type: 'bytes' },
        ],
        name: 'setAddr',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const,
    functionName: 'setAddr',
    args: [node, coinType, addrBytes],
  })
  return tx
}

async function setTextRecord(
  walletClient: WalletClient,
  resolver: Address,
  name: string,
  key: string,
  value: string,
): Promise<Hash> {
  const node = namehash(name)
  const tx = await walletClient.writeContract({
    address: resolver,
    abi: [
      {
        inputs: [
          { name: 'node', type: 'bytes32' },
          { name: 'key', type: 'string' },
          { name: 'value', type: 'string' },
        ],
        name: 'setText',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const,
    functionName: 'setText',
    args: [node, key, value],
  })
  return tx
}

async function setContenthashRecord(
  walletClient: WalletClient,
  resolver: Address,
  name: string,
  contenthash: `0x${string}`,
): Promise<Hash> {
  const node = namehash(name)
  const tx = await walletClient.writeContract({
    address: resolver,
    abi: [
      {
        inputs: [
          { name: 'node', type: 'bytes32' },
          { name: 'hash', type: 'bytes' },
        ],
        name: 'setContenthash',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const,
    functionName: 'setContenthash',
    args: [node, contenthash],
  })
  return tx
}

async function setAbiRecord(
  walletClient: WalletClient,
  resolver: Address,
  name: string,
  contentType: bigint,
  data: `0x${string}`,
): Promise<Hash> {
  const node = namehash(name)
  const tx = await walletClient.writeContract({
    address: resolver,
    abi: [
      {
        inputs: [
          { name: 'node', type: 'bytes32' },
          { name: 'contentType', type: 'uint256' },
          { name: 'data', type: 'bytes' },
        ],
        name: 'setABI',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const,
    functionName: 'setABI',
    args: [node, contentType, data],
  })
  return tx
}

async function approveNameWrapper(
  walletClient: WalletClient,
  baseRegistrar: Address,
  nameWrapper: Address,
): Promise<Hash> {
  const tx = await walletClient.writeContract({
    address: baseRegistrar,
    abi: [
      {
        inputs: [
          { name: 'operator', type: 'address' },
          { name: 'approved', type: 'bool' },
        ],
        name: 'setApprovalForAll',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const,
    functionName: 'setApprovalForAll',
    args: [nameWrapper, true],
  })
  return tx
}

async function wrapETH2LD(
  walletClient: WalletClient,
  nameWrapper: Address,
  label: string,
  owner: Address,
  resolver: Address,
): Promise<Hash> {
  const tx = await walletClient.writeContract({
    address: nameWrapper,
    abi: [
      {
        inputs: [
          { name: 'label', type: 'string' },
          { name: 'wrappedOwner', type: 'address' },
          { name: 'fuses', type: 'uint16' },
          { name: 'resolver', type: 'address' },
        ],
        name: 'wrapETH2LD',
        outputs: [{ name: '', type: 'uint64' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const,
    functionName: 'wrapETH2LD',
    args: [label, owner, 0, resolver],
  })
  return tx
}

async function setSubnodeOwner(
  walletClient: WalletClient,
  nameWrapper: Address,
  parentName: string,
  label: string,
  owner: Address,
  fuses: number,
  expiry: bigint,
): Promise<Hash> {
  const parentNode = namehash(parentName)
  const tx = await walletClient.writeContract({
    address: nameWrapper,
    abi: [
      {
        inputs: [
          { name: 'parentNode', type: 'bytes32' },
          { name: 'label', type: 'string' },
          { name: 'owner', type: 'address' },
          { name: 'fuses', type: 'uint32' },
          { name: 'expiry', type: 'uint64' },
        ],
        name: 'setSubnodeOwner',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const,
    functionName: 'setSubnodeOwner',
    args: [parentNode, label, owner, fuses, expiry],
  })
  return tx
}

async function setSubnodeOwnerRegistry(
  walletClient: WalletClient,
  registry: Address,
  parentName: string,
  label: string,
  owner: Address,
): Promise<Hash> {
  const parentNode = namehash(parentName)
  const labelHash = keccak256(toHex(label))
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
    args: [parentNode, labelHash, owner],
  })
  return tx
}

async function waitForTransaction(publicClient: any, hash: Hash) {
  // Mine a block to include the transaction
  await mineBlock()

  let receipt:
    | Awaited<ReturnType<typeof publicClient.getTransactionReceipt>>
    | undefined
  for (let i = 0; i < 20; i++) {
    try {
      receipt = await publicClient.getTransactionReceipt({ hash })
      if (receipt) {
        if (receipt.status !== 'success') {
          throw new Error(`Transaction ${hash} reverted`)
        }
        return receipt
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('reverted')) {
        throw e
      }
      // Not found yet
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`Transaction ${hash} not found after 4 seconds`)
}

export async function seedTestNames(l1Url = 'http://localhost:8545') {
  console.log('🌱 Seeding test names...')

  const {
    walletClient,
    walletClient2,
    publicClient,
    addresses,
    account,
    account2,
  } = await setupClients(l1Url)

  try {
    // Helper to conditionally wait for transaction
    const maybeWaitForTx = async (hash: Hash) => {
      if (hash !== '0x0') {
        await waitForTransaction(publicClient, hash)
        return true
      }
      return false
    }

    // Register "with-profile.eth" for account2 (0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC)
    // This name is expected by many tests with primary name and address records
    // Using Legacy controller = unwrapped name (for getWrapperData null test)
    console.log('  📝 Registering with-profile.eth (unwrapped)...')
    const txProfile = await registerUnwrappedName(
      walletClient,
      publicClient,
      addresses.LegacyETHRegistrarController,
      addresses.LegacyPublicResolver,
      'with-profile',
      account2.address,
    )
    if (await maybeWaitForTx(txProfile)) {
      console.log('  ✓ Registered with-profile.eth')
    }

    // Set addr record for with-profile.eth pointing to account2
    console.log('  📝 Setting addr record for with-profile.eth...')
    try {
      const txAddr = await setAddrRecord(
        walletClient2,
        addresses.LegacyPublicResolver,
        'with-profile.eth',
        account2.address,
      )
      await waitForTransaction(publicClient, txAddr)
      console.log('  ✓ Set addr record for with-profile.eth')
    } catch (e) {
      console.log('  ⏭️ Skipping addr record (may already exist)')
    }

    // Set primary name for account2 to with-profile.eth
    console.log('  📝 Setting primary name for account2...')
    try {
      const txPrimary = await setPrimaryName(
        walletClient2,
        addresses.ReverseRegistrar,
        'with-profile.eth',
      )
      await waitForTransaction(publicClient, txPrimary)
      console.log('  ✓ Set primary name for account2')
    } catch (e) {
      console.log('  ⏭️ Skipping primary name (may already exist)')
    }

    // Set text record for with-profile.eth (description = "Hello2")
    console.log('  📝 Setting text record for with-profile.eth...')
    try {
      const txText = await setTextRecord(
        walletClient2,
        addresses.LegacyPublicResolver,
        'with-profile.eth',
        'description',
        'Hello2',
      )
      await waitForTransaction(publicClient, txText)
      console.log('  ✓ Set text record for with-profile.eth')
    } catch (e) {
      console.log('  ⏭️ Skipping text record (may already exist)')
    }

    // Set etcLegacy (coin 61) address for with-profile.eth
    // Using the same address as ETH but for coin type 61
    console.log('  📝 Setting etcLegacy address for with-profile.eth...')
    try {
      const txEtc = await setAddrRecordWithCoin(
        walletClient2,
        addresses.LegacyPublicResolver,
        'with-profile.eth',
        61n,
        account2.address,
      )
      await waitForTransaction(publicClient, txEtc)
      console.log('  ✓ Set etcLegacy address for with-profile.eth')
    } catch (e) {
      console.log('  ⏭️ Skipping etcLegacy record (may already exist)')
    }

    // Register "with-contenthash.eth" and set contenthash (unwrapped)
    console.log('  📝 Registering with-contenthash.eth (unwrapped)...')
    const txContenthash = await registerUnwrappedName(
      walletClient,
      publicClient,
      addresses.LegacyETHRegistrarController,
      addresses.LegacyPublicResolver,
      'with-contenthash',
      account.address,
    )
    await maybeWaitForTx(txContenthash)
    console.log('  ✓ Registered with-contenthash.eth')

    // Set contenthash record (ipfs://bafybeico3uuyj3vphxpvbowchdwjlrlrh62awxscrnii7w7flu5z6fk77y)
    // Encoded as: e3010170122002ee392573f8a323abde0c04710971f2cac7a8eb00b9234f7bd82f9e664ebffc
    console.log('  📝 Setting contenthash for with-contenthash.eth...')
    try {
      const txSetContenthash = await setContenthashRecord(
        walletClient,
        addresses.LegacyPublicResolver,
        'with-contenthash.eth',
        '0xe3010170122002ee392573f8a323abde0c04710971f2cac7a8eb00b9234f7bd82f9e664ebffc',
      )
      await waitForTransaction(publicClient, txSetContenthash)
      console.log('  ✓ Set contenthash for with-contenthash.eth')
    } catch (e) {
      console.log('  ⏭️ Skipping contenthash (may already exist)')
    }

    // ABI test data
    const dummyABI = [
      {
        type: 'event',
        anonymous: false,
        name: 'ABIChanged',
        inputs: [
          { type: 'bytes32', indexed: true },
          { type: 'uint256', indexed: true },
        ],
      },
      {
        type: 'event',
        anonymous: false,
        name: 'VersionChanged',
        inputs: [{ type: 'bytes32', indexed: true }, { type: 'uint64' }],
      },
      {
        type: 'function',
        name: 'ABI',
        constant: true,
        stateMutability: 'view',
        payable: false,
        inputs: [{ type: 'bytes32' }, { type: 'uint256' }],
        outputs: [{ type: 'uint256' }, { type: 'bytes' }],
      },
      {
        type: 'function',
        name: 'clearRecords',
        constant: false,
        payable: false,
        inputs: [{ type: 'bytes32' }],
        outputs: [],
      },
      {
        type: 'function',
        name: 'recordVersions',
        constant: true,
        stateMutability: 'view',
        payable: false,
        inputs: [{ type: 'bytes32' }],
        outputs: [{ type: 'uint64' }],
      },
      {
        type: 'function',
        name: 'setABI',
        constant: false,
        payable: false,
        inputs: [{ type: 'bytes32' }, { type: 'uint256' }, { type: 'bytes' }],
        outputs: [],
      },
      {
        type: 'function',
        name: 'supportsInterface',
        constant: true,
        stateMutability: 'view',
        payable: false,
        inputs: [{ type: 'bytes4' }],
        outputs: [{ type: 'bool' }],
      },
    ]

    // Encode ABI for different content types
    const abiJsonStr = JSON.stringify(dummyABI)
    const abiType1 = stringToHex(abiJsonStr) as `0x${string}`
    const abiType2 = toHex(pako.deflate(abiJsonStr)) as `0x${string}`
    const abiType4 = bytesToHex(
      new Uint8Array(cborEncode(dummyABI)),
    ) as `0x${string}`
    const abiType8 = stringToHex('https://example.com') as `0x${string}`

    // Register and set ABI for with-type-1-abi.eth (unwrapped)
    console.log('  📝 Registering with-type-1-abi.eth (unwrapped)...')
    const txAbi1 = await registerUnwrappedName(
      walletClient,
      publicClient,
      addresses.LegacyETHRegistrarController,
      addresses.LegacyPublicResolver,
      'with-type-1-abi',
      account.address,
    )
    await maybeWaitForTx(txAbi1)
    const txSetAbi1 = await setAbiRecord(
      walletClient,
      addresses.LegacyPublicResolver,
      'with-type-1-abi.eth',
      1n,
      abiType1,
    )
    await waitForTransaction(publicClient, txSetAbi1)
    console.log('  ✓ Registered with-type-1-abi.eth')

    // Register and set ABI for with-type-2-abi.eth (unwrapped)
    console.log('  📝 Registering with-type-2-abi.eth (unwrapped)...')
    const txAbi2 = await registerUnwrappedName(
      walletClient,
      publicClient,
      addresses.LegacyETHRegistrarController,
      addresses.LegacyPublicResolver,
      'with-type-2-abi',
      account.address,
    )
    await maybeWaitForTx(txAbi2)
    const txSetAbi2 = await setAbiRecord(
      walletClient,
      addresses.LegacyPublicResolver,
      'with-type-2-abi.eth',
      2n,
      abiType2,
    )
    await waitForTransaction(publicClient, txSetAbi2)
    console.log('  ✓ Registered with-type-2-abi.eth')

    // Register and set ABI for with-type-4-abi.eth (unwrapped)
    console.log('  📝 Registering with-type-4-abi.eth (unwrapped)...')
    const txAbi4 = await registerUnwrappedName(
      walletClient,
      publicClient,
      addresses.LegacyETHRegistrarController,
      addresses.LegacyPublicResolver,
      'with-type-4-abi',
      account.address,
    )
    await maybeWaitForTx(txAbi4)
    const txSetAbi4 = await setAbiRecord(
      walletClient,
      addresses.LegacyPublicResolver,
      'with-type-4-abi.eth',
      4n,
      abiType4,
    )
    await waitForTransaction(publicClient, txSetAbi4)
    console.log('  ✓ Registered with-type-4-abi.eth')

    // Register and set ABI for with-type-8-abi.eth (unwrapped)
    console.log('  📝 Registering with-type-8-abi.eth (unwrapped)...')
    const txAbi8 = await registerUnwrappedName(
      walletClient,
      publicClient,
      addresses.LegacyETHRegistrarController,
      addresses.LegacyPublicResolver,
      'with-type-8-abi',
      account.address,
    )
    await maybeWaitForTx(txAbi8)
    const txSetAbi8 = await setAbiRecord(
      walletClient,
      addresses.LegacyPublicResolver,
      'with-type-8-abi.eth',
      8n,
      abiType8,
    )
    await waitForTransaction(publicClient, txSetAbi8)
    console.log('  ✓ Registered with-type-8-abi.eth')

    // Register and set ABI for with-type-256-abi.eth (unsupported type, unwrapped)
    console.log('  📝 Registering with-type-256-abi.eth (unwrapped)...')
    const txAbi256 = await registerUnwrappedName(
      walletClient,
      publicClient,
      addresses.LegacyETHRegistrarController,
      addresses.LegacyPublicResolver,
      'with-type-256-abi',
      account.address,
    )
    await maybeWaitForTx(txAbi256)
    const txSetAbi256 = await setAbiRecord(
      walletClient,
      addresses.LegacyPublicResolver,
      'with-type-256-abi.eth',
      256n,
      abiType1,
    )
    await waitForTransaction(publicClient, txSetAbi256)
    console.log('  ✓ Registered with-type-256-abi.eth')

    // Register and set all ABI types for with-type-all-abi.eth (unwrapped)
    console.log('  📝 Registering with-type-all-abi.eth (unwrapped)...')
    const txAbiAll = await registerUnwrappedName(
      walletClient,
      publicClient,
      addresses.LegacyETHRegistrarController,
      addresses.LegacyPublicResolver,
      'with-type-all-abi',
      account.address,
    )
    await maybeWaitForTx(txAbiAll)
    // Set all ABI types
    const txSetAbiAll1 = await setAbiRecord(
      walletClient,
      addresses.LegacyPublicResolver,
      'with-type-all-abi.eth',
      1n,
      abiType1,
    )
    await waitForTransaction(publicClient, txSetAbiAll1)
    const txSetAbiAll2 = await setAbiRecord(
      walletClient,
      addresses.LegacyPublicResolver,
      'with-type-all-abi.eth',
      2n,
      abiType2,
    )
    await waitForTransaction(publicClient, txSetAbiAll2)
    const txSetAbiAll4 = await setAbiRecord(
      walletClient,
      addresses.LegacyPublicResolver,
      'with-type-all-abi.eth',
      4n,
      abiType4,
    )
    await waitForTransaction(publicClient, txSetAbiAll4)
    const txSetAbiAll8 = await setAbiRecord(
      walletClient,
      addresses.LegacyPublicResolver,
      'with-type-all-abi.eth',
      8n,
      abiType8,
    )
    await waitForTransaction(publicClient, txSetAbiAll8)
    console.log('  ✓ Registered with-type-all-abi.eth')

    // Register "test123.eth" for account (unwrapped - needed for getOwner test)
    console.log('  📝 Registering test123.eth (unwrapped)...')
    const txTest123 = await registerUnwrappedName(
      walletClient,
      publicClient,
      addresses.LegacyETHRegistrarController,
      addresses.LegacyPublicResolver,
      'test123',
      account.address,
    )
    await maybeWaitForTx(txTest123)
    console.log('  ✓ Registered test123.eth')

    // Register "with-subnames.eth" (unwrapped)
    console.log('  📝 Registering with-subnames.eth (unwrapped)...')
    const tx1 = await registerUnwrappedName(
      walletClient,
      publicClient,
      addresses.LegacyETHRegistrarController,
      addresses.LegacyPublicResolver,
      'with-subnames',
      account.address,
    )
    await maybeWaitForTx(tx1)
    console.log('  ✓ Registered with-subnames.eth')

    // Create subname test.with-subnames.eth on the registry for account2
    // This is needed by wrapName (other) and transferName (registry) tests
    console.log('  📝 Creating test.with-subnames.eth on registry...')
    try {
      const txSubnameTest = await setSubnodeOwnerRegistry(
        walletClient,
        addresses.ENSRegistry,
        'with-subnames.eth',
        'test',
        account2.address,
      )
      await waitForTransaction(publicClient, txSubnameTest)
      console.log('  ✓ Created test.with-subnames.eth')
    } catch (e) {
      console.log('  ⏭️ Skipping test.with-subnames.eth (may already exist)')
    }

    // Register "wrapped.eth" (wrapped via ETHRegistrarController + NameWrapper)
    // Use PublicResolver (NameWrapper-aware) so record operations by NameWrapper owner work
    console.log('  📝 Registering wrapped.eth (wrapped)...')
    const tx2 = await registerWrappedName(
      walletClient,
      publicClient,
      addresses.ETHRegistrarController,
      addresses.PublicResolver,
      'wrapped',
      account.address,
      addresses.BaseRegistrarImplementation,
      addresses.NameWrapper,
    )
    await maybeWaitForTx(tx2)
    console.log('  ✓ Registered wrapped.eth')

    // Register "wrapped-with-subnames.eth" (wrapped)
    console.log('  📝 Registering wrapped-with-subnames.eth (wrapped)...')
    const tx3 = await registerWrappedName(
      walletClient,
      publicClient,
      addresses.ETHRegistrarController,
      addresses.PublicResolver,
      'wrapped-with-subnames',
      account.address,
      addresses.BaseRegistrarImplementation,
      addresses.NameWrapper,
    )
    await maybeWaitForTx(tx3)
    console.log('  ✓ Registered wrapped-with-subnames.eth')

    // Create subname test.wrapped-with-subnames.eth for account2
    console.log('  📝 Creating test.wrapped-with-subnames.eth...')
    try {
      const futureExpiry = BigInt(Math.floor(Date.now() / 1000) + 31536000 * 2) // 2 years from now
      const txSubname = await setSubnodeOwner(
        walletClient,
        addresses.NameWrapper,
        'wrapped-with-subnames.eth',
        'test',
        account2.address,
        0, // no fuses
        futureExpiry,
      )
      await waitForTransaction(publicClient, txSubname)
      console.log('  ✓ Created test.wrapped-with-subnames.eth')
    } catch (e) {
      console.log('  ⏭️ Skipping subname creation (may already exist)')
    }

    // Create subname addr.wrapped-with-subnames.eth for account2
    // This is needed by deleteSubname (nameWrapper, asOwner) test
    console.log('  📝 Creating addr.wrapped-with-subnames.eth...')
    try {
      const futureExpiry2 = BigInt(Math.floor(Date.now() / 1000) + 31536000 * 2) // 2 years from now
      const txAddrSubname = await setSubnodeOwner(
        walletClient,
        addresses.NameWrapper,
        'wrapped-with-subnames.eth',
        'addr',
        account2.address,
        0, // no fuses
        futureExpiry2,
      )
      await waitForTransaction(publicClient, txAddrSubname)
      console.log('  ✓ Created addr.wrapped-with-subnames.eth')
    } catch (e) {
      console.log('  ⏭️ Skipping addr subname creation (may already exist)')
    }

    // Register "wrapped-with-expiring-subnames.eth" (wrapped)
    console.log(
      '  📝 Registering wrapped-with-expiring-subnames.eth (wrapped)...',
    )
    const tx4 = await registerWrappedName(
      walletClient,
      publicClient,
      addresses.ETHRegistrarController,
      addresses.PublicResolver,
      'wrapped-with-expiring-subnames',
      account.address,
      addresses.BaseRegistrarImplementation,
      addresses.NameWrapper,
    )
    await maybeWaitForTx(tx4)
    console.log('  ✓ Registered wrapped-with-expiring-subnames.eth')

    // Register "wrapped-big-duration.eth" with a long duration (wrapped)
    console.log('  📝 Registering wrapped-big-duration.eth (wrapped)...')
    const txBigDuration = await registerWrappedName(
      walletClient,
      publicClient,
      addresses.ETHRegistrarController,
      addresses.PublicResolver,
      'wrapped-big-duration',
      account.address,
      addresses.BaseRegistrarImplementation,
      addresses.NameWrapper,
      315360000, // 10 years
    )
    await maybeWaitForTx(txBigDuration)
    console.log('  ✓ Registered wrapped-big-duration.eth')

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
