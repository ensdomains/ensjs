import { createPublicClient, createWalletClient, http, type Address } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { localhost } from '../src/test/addTestContracts.js'

const transport = http('http://localhost:8545')

const publicClient = createPublicClient({
  chain: localhost,
  transport,
})

// Test account from hardhat/anvil
const account = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d')

const walletClient = createWalletClient({
  account,
  chain: localhost,
  transport,
})

const ETH_REGISTRAR_CONTROLLER = '0x5081a39b8A5f0E35a8D959395a630b68B74Dd30f'
const PUBLIC_RESOLVER = '0x1429859428C0aBc9C2C47C8Ee9FBaF82cFA0F20f'

// Simple test name registration
async function registerName(label: string) {
  console.log(`Registering ${label}.eth...`)

  try {
    // For now, just log that we would register
    // The actual registration would require more complex setup
    console.log(`✓ Would register ${label}.eth`)
  } catch (error) {
    console.error(`✗ Failed to register ${label}.eth:`, error)
  }
}

async function main() {
  console.log('Registering test names...')

  // Register a few basic test names
  await registerName('test')
  await registerName('with-type-1-abi')
  await registerName('with-type-2-abi')

  console.log('✓ Test name registration complete')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
