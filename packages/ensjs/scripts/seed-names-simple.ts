/**
 * Simple script to register test names directly on devnet
 * Run with: npx tsx scripts/seed-names-simple.ts
 */
import {
  type Address,
  createPublicClient,
  createWalletClient,
  getAddress,
  type Hash,
  http,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

// Anvil test accounts
const account1 = privateKeyToAccount(
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
)
const account2 = privateKeyToAccount(
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
)

// Devnet fixed addresses
const ADDRESSES = {
  ETHRegistrarController: getAddress('0x5081a39b8A5f0E35a8D959395a630b68B74Dd30f'),
  LegacyPublicResolver: getAddress('0xf8e81D47203A594245E36C48e151709F0C19fBe8'),
  ENSRegistry: getAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3'),
}

const publicClient = createPublicClient({
  transport: http('http://localhost:8545'),
})

const walletClient = createWalletClient({
  account: account1,
  transport: http('http://localhost:8545'),
})

async function checkController() {
  // Check if this is actually LegacyETHRegistrarController by trying to call available()
  try {
    const available = await publicClient.readContract({
      address: ADDRESSES.ETHRegistrarController,
      abi: [
        {
          inputs: [{ name: 'name', type: 'string' }],
          name: 'available',
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      functionName: 'available',
      args: ['test'],
    })
    console.log('✓ Controller available() works:', available)

    // Try legacy function
    try {
      const commitment = await publicClient.readContract({
        address: ADDRESSES.ETHRegistrarController,
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
        ],
        functionName: 'makeCommitmentWithConfig',
        args: [
          'test',
          account1.address,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          ADDRESSES.LegacyPublicResolver,
          account1.address,
        ],
      })
      console.log('✓ Legacy makeCommitmentWithConfig works:', commitment)
      return 'legacy'
    } catch (e: any) {
      console.log('✗ Legacy makeCommitmentWithConfig failed:', e.shortMessage)
    }

    // Try new function
    try {
      const commitment = await publicClient.readContract({
        address: ADDRESSES.ETHRegistrarController,
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
        ],
        functionName: 'makeCommitment',
        args: [
          'test',
          account1.address,
          31536000n,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          ADDRESSES.LegacyPublicResolver,
          [],
          false,
          0,
        ],
      })
      console.log('✓ New makeCommitment works:', commitment)
      return 'new'
    } catch (e: any) {
      console.log('✗ New makeCommitment failed:', e.shortMessage)
    }

    return 'unknown'
  } catch (e: any) {
    console.error('✗ Controller check failed:', e.message)
    throw e
  }
}

async function main() {
  console.log('🔍 Checking controller at', ADDRESSES.ETHRegistrarController)
  const controllerType = await checkController()
  console.log('\nController type:', controllerType)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
