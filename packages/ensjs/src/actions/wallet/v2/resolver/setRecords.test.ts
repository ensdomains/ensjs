import type { Address } from 'viem'
import { decodeFunctionData } from 'viem'
import { describe, expect, it } from 'vitest'
import { NoRecordsSpecifiedError } from '../../../../errors/public.js'
import {
  dnsEncodeName,
  setTextParameters,
} from '../../../../utils/v2/resolver/recordParameters.js'
import { setRecordsWriteParameters } from './setRecords.js'

const resolverAddress = '0x1111111111111111111111111111111111111111' as Address
const client = {
  account: { address: '0x2222222222222222222222222222222222222222' },
  chain: { id: 1 },
} as unknown as Parameters<typeof setRecordsWriteParameters>[0]

describe('setRecordsWriteParameters', () => {
  it('throws when no records are given', async () => {
    await expect(
      setRecordsWriteParameters(client, { name: 'test.eth', resolverAddress }),
    ).rejects.toBeInstanceOf(NoRecordsSpecifiedError)
  })

  it('sends a single change as the setter call itself', async () => {
    const params = await setRecordsWriteParameters(client, {
      name: 'test.eth',
      resolverAddress,
      texts: [{ key: 'avatar', value: 'x' }],
    })
    expect(params.functionName).toBe('setText')
    expect(params.args).toEqual([dnsEncodeName('test.eth'), 'avatar', 'x'])
  })

  it('wraps several changes in multicall(bytes[]) of name-based setters', async () => {
    const params = await setRecordsWriteParameters(client, {
      name: 'test.eth',
      resolverAddress,
      texts: [{ key: 'avatar', value: 'x' }],
      coins: [
        { coin: 'ETH', value: '0x1234567890AbcdEF1234567890aBcdef12345678' },
      ],
    })
    expect(params.functionName).toBe('multicall')
    const [calls] = params.args as [readonly `0x${string}`[]]
    expect(calls).toHaveLength(2)

    const text = setTextParameters({
      name: 'test.eth',
      key: 'avatar',
      value: 'x',
    })
    expect(decodeFunctionData({ abi: text.abi, data: calls[0] }).args).toEqual([
      dnsEncodeName('test.eth'),
      'avatar',
      'x',
    ])
  })
})
