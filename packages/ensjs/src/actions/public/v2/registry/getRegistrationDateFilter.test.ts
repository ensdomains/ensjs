import { labelhash } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import { getRegistrationDate } from './getRegistrationDate.js'

const REGISTRY = '0x657eA849311d3D5823348ddEd7C2AaAFb3EDE09E' as const

const clientRecording = (logs: unknown[]) => {
  const seen: { topics?: unknown[] }[] = []
  return {
    seen,
    client: {
      chain: { id: 11155111 },
      request: async ({
        method,
        params,
      }: {
        method: string
        params: never
      }) => {
        if (method === 'eth_getLogs') {
          seen.push((params as unknown[])[0] as { topics?: unknown[] })
          return logs
        }
        if (method === 'eth_getBlockByNumber') return { timestamp: '0x64' }
        throw new Error(`unexpected ${method}`)
      },
    } as never,
  }
}

describe('getRegistrationDate log filter', () => {
  // A token id carries a version in its low bits that increments on
  // re-registration, so filtering on the id the registry reports today misses
  // the name's own registration event. labelHash does not move.
  it('filters on labelHash, not the current token id', async () => {
    const { client, seen } = clientRecording([])

    await getRegistrationDate(client, {
      label: 'rabbit',
      registryAddress: REGISTRY,
    })

    expect(seen).toHaveLength(1)
    const topics = seen[0]?.topics as (string | null)[]
    // [event, tokenId, labelHash] — the id slot must be unconstrained.
    expect(topics[1]).toBeNull()
    expect(topics[2]).toBe(labelhash('rabbit'))
  })

  it('never reads getTokenId, so no second round trip', async () => {
    const request = vi.fn(async ({ method }: { method: string }) => {
      if (method === 'eth_getLogs') return []
      throw new Error(`unexpected ${method}`)
    })

    await getRegistrationDate({ chain: { id: 11155111 }, request } as never, {
      label: 'rabbit',
      registryAddress: REGISTRY,
    })

    expect(
      request.mock.calls.some(([{ method }]) => method === 'eth_call'),
    ).toBe(false)
  })
})
