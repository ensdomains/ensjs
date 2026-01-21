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
    // Real addresses from namechain devnet (queried from docker logs)
    const contractAddresses = {
      ENSRegistry: '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82',
      UniversalResolver: '0x82e01223d51Eb87e16A03E24687EDF0F294da6f1',
      Multicall: '0xc351628EB244ec633d5f21fBD6621e1a683B1181',
      BaseRegistrarImplementation: '0x851356ae760d987E095750cCeb3bC6014560891C',
      DNSRegistrar: '0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9',
      LegacyETHRegistrarController: '0x172076E0166D1F9Cc711C77Adf8488051744980C',
      WrappedETHRegistrarController: '0x253553366Da8546fC250F225fe3d25d0C782303b',
      NameWrapper: '0x162A433068F51e18b7d13932F27e66a3f99E6890',
      PublicResolver: '0x4C2F7092C2aE51D986bEFEe378e50BD4dB99C901',
      LegacyPublicResolver: '0x367761085BF3C12e5DA2Df99AC6E1a824612b8fb',
      ReverseRegistrar: '0xFD471836031dc5108809D173A067e8486B9047A3',
      DefaultReverseRegistrar: '0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf',
      StaticBulkRenewal: '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B',
      DNSSECImpl: '0x01D3A140FE0e5DFB9C82366784Bb7f35af49e7CE',
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
