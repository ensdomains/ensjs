import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { seedTestNames } from './seedTestNames.js'

const execAsync = promisify(exec)

const DOCKER_COMPOSE_FILE = './compose.yml'
const STARTUP_TIMEOUT = 180000 // 3 minutes
const HEALTH_CHECK_INTERVAL = 2000 // 2 seconds

let startedByUs = false

async function isDevnetRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:8545', {
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
      return data.result !== undefined
    }
  } catch {
    // ignore
  }
  return false
}

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

async function waitForDevnetReady(timeout: number): Promise<void> {
  const startTime = Date.now()
  // The devnet exposes a healthcheck endpoint on port 8000 that returns 200
  // only after all contracts are deployed and test names are seeded
  const healthUrl = 'http://localhost:8000/health'

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(healthUrl)
      if (response.ok) {
        console.log('✓ Devnet is ready (contracts deployed, names seeded)')
        return
      }
    } catch {
      // not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, HEALTH_CHECK_INTERVAL))
  }

  throw new Error(`Devnet did not become ready within ${timeout}ms`)
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
      // ignore
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error(`RPC at ${url} did not become ready within ${timeout}ms`)
}

export async function setup() {
  if (await isDevnetRunning()) {
    console.log('✓ Devnet already running, skipping docker compose')

    // Wait for devnet to be fully ready (contracts deployed + names seeded)
    // even when devnet was started externally
    console.log('Waiting for devnet to be ready...')
    await waitForDevnetReady(STARTUP_TIMEOUT)

    // Devnet was started externally — seed test names as a fallback
    // (idempotent, skips already registered names)
    await seedTestNames()
  } else {
    console.log('Starting Docker Compose services...')

    try {
      // Start only the devnet service (other services like ensindexer are not needed for unit tests)
      // The devnet image runs with --testNames which seeds names automatically
      await execAsync(`docker compose -f ${DOCKER_COMPOSE_FILE} up -d devnet`)
      console.log('✓ Devnet service started')
      startedByUs = true

      // Wait for devnet to be fully ready (contracts deployed + names seeded)
      console.log('Waiting for devnet to be ready...')
      await waitForDevnetReady(STARTUP_TIMEOUT)

      // Seed v1 test names (the devnet --testNames only seeds v2-style names)
      await seedTestNames()
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

  console.log('✓ Test environment is ready')
}

export async function teardown() {
  if (startedByUs) {
    console.log('Stopping Docker Compose services...')

    try {
      await execAsync(`docker compose -f ${DOCKER_COMPOSE_FILE} down -v`)
      console.log('✓ Docker Compose services stopped')
    } catch (error) {
      console.error('Failed to stop Docker Compose services:', error)
      throw error
    }
  }
}
