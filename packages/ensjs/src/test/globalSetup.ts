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
