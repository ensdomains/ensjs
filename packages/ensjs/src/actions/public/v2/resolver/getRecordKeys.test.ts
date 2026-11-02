import { namehash, zeroHash } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import { getRecordKeys } from './getRecordKeys.js'

const RESOLVER = '0x6C9Fb0A64dcE231A971ba3407D058F23E97Acad0' as const
const NAME = '1.dragonsy.eth'

type Log = { args: Record<string, unknown> }

// getAction prefers the client's own action, so only these two are stubbed.
const clientWith = ({
  recordIds,
  logs = {},
}: {
  recordIds: Record<string, bigint>
  logs?: Partial<Record<'TextUpdated' | 'AddressUpdated', Log[]>>
}) => {
  const readContract = vi.fn(
    async ({ args: [node] }: { args: [string] }) => recordIds[node] ?? 0n,
  )
  const getLogs = vi.fn(
    async ({
      event,
    }: {
      event: { name: 'TextUpdated' | 'AddressUpdated' }
      args: { recordId: bigint }
    }) => logs[event.name] ?? [],
  )
  return { client: { readContract, getLogs } as never, readContract, getLogs }
}

describe('getRecordKeys', () => {
  it('reads the keys of the record the name is linked to', async () => {
    const { client, getLogs } = clientWith({
      recordIds: { [namehash(NAME)]: 2n, [zeroHash]: 1n },
      logs: {
        TextUpdated: [
          { args: { key: 'test', value: 'test' } },
          { args: { key: 'url', value: 'https://x' } },
        ],
        AddressUpdated: [{ args: { coinType: 60n, addressBytes: '0x12' } }],
      },
    })

    await expect(
      getRecordKeys(client, { resolverAddress: RESOLVER, name: NAME }),
    ).resolves.toEqual({ texts: ['test', 'url'], coinTypes: [60n] })
    expect(
      getLogs.mock.calls.map(([{ event, args }]) => [event.name, args]),
    ).toEqual([
      ['TextUpdated', { recordId: 2n }],
      ['AddressUpdated', { recordId: 2n }],
    ])
  })

  it('leaves out keys whose latest value was cleared', async () => {
    const { client } = clientWith({
      recordIds: { [namehash(NAME)]: 2n },
      logs: {
        TextUpdated: [
          { args: { key: 'test', value: 'test' } },
          { args: { key: 'test', value: '' } },
          { args: { key: 'url', value: '' } },
          { args: { key: 'url', value: 'https://x' } },
        ],
        AddressUpdated: [
          { args: { coinType: 60n, addressBytes: '0x12' } },
          { args: { coinType: 60n, addressBytes: '0x' } },
        ],
      },
    })

    await expect(
      getRecordKeys(client, { resolverAddress: RESOLVER, name: NAME }),
    ).resolves.toEqual({ texts: ['url'], coinTypes: [] })
  })

  it('reads the default record for an unlinked name, as resolve does', async () => {
    const { client, getLogs } = clientWith({
      recordIds: { [zeroHash]: 1n },
      logs: { TextUpdated: [{ args: { key: 'name', value: 'resolver' } }] },
    })

    await expect(
      getRecordKeys(client, { resolverAddress: RESOLVER, name: NAME }),
    ).resolves.toEqual({ texts: ['name'], coinTypes: [] })
    expect(getLogs.mock.calls[0]?.[0]).toMatchObject({ args: { recordId: 1n } })
  })

  it('reads no logs when neither the name nor the default has a record', async () => {
    const { client, getLogs } = clientWith({ recordIds: {} })

    await expect(
      getRecordKeys(client, { resolverAddress: RESOLVER, name: NAME }),
    ).resolves.toEqual({ texts: [], coinTypes: [] })
    expect(getLogs).not.toHaveBeenCalled()
  })
})
