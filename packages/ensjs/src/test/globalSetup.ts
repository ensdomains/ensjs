import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

const DOCKER_COMPOSE_FILE = './compose.yaml'
const STARTUP_TIMEOUT = 180000 // 3 minutes
const HEALTH_CHECK_INTERVAL = 2000 // 2 seconds

async function waitForHealthy(timeout: number): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    try {
      const { stdout } = await execAsync(
        `docker compose -f ${DOCKER_COMPOSE_FILE} ps --format json`,
      )
      const services = stdout
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line))

      // Check if all services are running or healthy
      const allRunning = services.every(
        (service) => service.State === 'running',
      )

      // Check if services with healthchecks are healthy
      const servicesWithHealth = services.filter(
        (service) => service.Health && service.Health !== '',
      )
      const allHealthy =
        servicesWithHealth.length === 0 ||
        servicesWithHealth.every((service) => service.Health === 'healthy')

      if (allRunning && allHealthy) {
        console.log('✓ All Docker services are healthy and running')
        return
      }

      // Show progress
      const healthyCount = servicesWithHealth.filter(
        (s) => s.Health === 'healthy',
      ).length
      const totalHealthChecks = servicesWithHealth.length
      if (totalHealthChecks > 0) {
        console.log(
          `⏳ Waiting for services to be healthy (${healthyCount}/${totalHealthChecks})...`,
        )
      }
    } catch (_error) {
      // Ignore errors during health check, will retry
    }

    await new Promise((resolve) => setTimeout(resolve, HEALTH_CHECK_INTERVAL))
  }

  throw new Error(`Docker services did not become healthy within ${timeout}ms`)
}

async function waitForRPC(url: string, timeout: number): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.result) {
          console.log(`✓ RPC at ${url} is ready`)
          return
        }
      }
    } catch (_error) {
      // Ignore errors, will retry
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error(`RPC at ${url} did not become ready within ${timeout}ms`)
}

export async function setup() {
  console.log('Starting Docker Compose services...')

  try {
    // Start Docker Compose services
    await execAsync(`docker compose -f ${DOCKER_COMPOSE_FILE} up -d`)
    console.log('✓ Docker Compose services started')

    // Wait for services to be healthy
    await waitForHealthy(STARTUP_TIMEOUT)

    // Wait for L1 RPC to be ready
    console.log('Waiting for L1 RPC to be ready...')
    await waitForRPC('http://localhost:8545', 30000)

    // Wait for L2 RPC to be ready
    console.log('Waiting for L2 RPC to be ready...')
    await waitForRPC('http://localhost:8546', 30000)

    // Get contract addresses from devnet
    console.log('Fetching contract addresses...')
    const _addressesResponse = await fetch('http://localhost:8545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getStorageAt',
        params: ['0x0000000000000000000000000000000000000000', '0x0', 'latest'],
        id: 1,
      }),
    })

    // Export contract addresses as environment variable for hardhat
    // L1 and L2 contracts (namechain deploys same addresses on both chains)
    const contractAddresses = {
      ENSRegistry: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      UniversalResolver: '0x82e01223d51Eb87e16A03E24687EDF0F294da6f1',
      Multicall: '0xc351628EB244ec633d5f21fBD6621e1a683B1181',
      BaseRegistrarImplementation: '0x36b58F5C1969B7b6591D752ea6F5486D069010AB',
      DNSRegistrar: '0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9',
      ETHRegistrarController: '0x5081a39b8A5f0E35a8D959395a630b68B74Dd30f',
      NameWrapper: '0x2E2Ed0Cfd3AD2f1d34481277b3204d807Ca2F8c2',
      PublicResolver: '0x1429859428C0aBc9C2C47C8Ee9FBaF82cFA0F20f',
      ReverseRegistrar: '0x9E545E3C0baAB3E08CdfD552C960A1050f373042',
      StaticBulkRenewal: '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B',
      DNSSECImpl: '0x01D3A140FE0e5DFB9C82366784Bb7f35af49e7CE',
      LegacyPublicResolver: '0xf8e81D47203A594245E36C48e151709F0C19fBe8',
      NoMulticallResolver: '0x0b306BF915C4d645ff596e518fAf3F9669b97016',
      OldestResolver: '0x922D6956C99E12DFeB3224DEA977D0939758A1Fe',
      Root: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
      USDC: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      // V2 L2 contracts (these need to be verified/updated based on actual deployment)
      DedicatedResolver: '0x0000000000000000000000000000000000000000',
      UserRegistry: '0x0000000000000000000000000000000000000000',
      V2EthRegistry: '0x0000000000000000000000000000000000000000',
      VerifiableFactory: '0x0000000000000000000000000000000000000000',
      EthRegistrar: '0x0000000000000000000000000000000000000000',
    }

    process.env.DEPLOYMENT_ADDRESSES = JSON.stringify(contractAddresses)
    console.log('✓ Contract addresses configured')

    // Seed test names
    console.log('Seeding test names...')
    try {
      const { seedTestNames } = await import('./seedTestNames.js')
      await seedTestNames('http://localhost:8545')
      console.log('✓ Test names seeded')
    } catch (error) {
      console.warn('⚠ Failed to seed test names:', error)
      console.warn(
        '  Tests requiring pre-registered names may fail. This is expected if',
      )
      console.warn('  the seeding script is not yet fully implemented.')
    }

    console.log('✓ Test environment is ready')
  } catch (error) {
    console.error('Failed to start Docker Compose services:', error)
    // Attempt cleanup on failure
    try {
      await execAsync(`docker compose -f ${DOCKER_COMPOSE_FILE} down -v`)
    } catch {
      // Ignore cleanup errors
    }
    throw error
  }
}

export async function teardown() {
  console.log('Stopping Docker Compose services...')

  try {
    await execAsync(`docker compose -f ${DOCKER_COMPOSE_FILE} down -v`)
    console.log('✓ Docker Compose services stopped')
  } catch (error) {
    console.error('Failed to stop Docker Compose services:', error)
    throw error
  }
}
