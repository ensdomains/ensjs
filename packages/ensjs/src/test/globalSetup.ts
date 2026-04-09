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
