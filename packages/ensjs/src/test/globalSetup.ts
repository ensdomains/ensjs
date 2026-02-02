import { exec } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
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
      // L1 contracts
      ENSRegistry: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
      UniversalResolver: '0x4631BCAbD6dF18D94796344963cB60d44a4136b6',
      Multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
      BaseRegistrarImplementation: '0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575',
      DNSRegistrar: '0x36b58F5C1969B7b6591D752ea6F5486D069010AB',
      LegacyETHRegistrarController: '0xBEc49fA140aCaA83533fB00A2BB19bDdd0290f25',
      WrappedETHRegistrarController: '0x253553366Da8546fC250F225fe3d25d0C782303b',
      ETHRegistrarController: '0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d',
      NameWrapper: '0xFD471836031dc5108809D173A067e8486B9047A3',
      PublicResolver: '0x49fd2BE640DB2910c2fAb69bB8531Ab6E76127ff',
      LegacyPublicResolver: '0x7A9Ec1d04904907De0ED7b6839CcdD59c3716AC9',
      ReverseRegistrar: '0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3',
      DefaultReverseRegistrar: '0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf',
      StaticBulkRenewal: '0xC9a43158891282A2B1475592D5719c001986Aaec',
      DNSSECImpl: '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F',
      NoMulticallResolver: '0x7A9Ec1d04904907De0ED7b6839CcdD59c3716AC9',
      OldestResolver: '0x7A9Ec1d04904907De0ED7b6839CcdD59c3716AC9',
      Root: '0x4826533B4897376654Bb4d4AD88B7faFD0C98528',
      USDC: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
      // V2 L2 contracts
      DedicatedResolver: '0x9A676e781A523b5d0C0e43731313A708CB607508',
      UserRegistry: '0x0B306BF915C4d645ff596e518fAf3F9669b97016',
      V2EthRegistry: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
      VerifiableFactory: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
      EthRegistrar: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
    }

    process.env.DEPLOYMENT_ADDRESSES = JSON.stringify(contractAddresses)

    // Write to .env.local so tests can read the addresses
    // (vitest globalSetup runs in a separate process)
    const envLocalPath = resolve(import.meta.dirname, '../../.env.local')
    writeFileSync(
      envLocalPath,
      `DEPLOYMENT_ADDRESSES='${JSON.stringify(contractAddresses)}'\n`,
    )
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
