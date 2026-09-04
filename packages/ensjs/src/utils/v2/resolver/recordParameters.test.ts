import { describe, expect, it } from 'vitest'
import {
  dnsEncodeName,
  resolverMulticallParameters,
  setAddressParameters,
  setContenthashParameters,
  setTextParameters,
} from './recordParameters.js'

describe('dnsEncodeName', () => {
  it('DNS-encodes a dotted name', () => {
    expect(dnsEncodeName('raffy.eth')).toBe('0x0572616666790365746800')
    expect(dnsEncodeName('')).toBe('0x00')
  })
})

describe('setAddressParameters', () => {
  it('addresses the record by DNS-encoded name', () => {
    const params = setAddressParameters({
      name: 'test.eth',
      coin: 'ETH',
      value: '0x1234567890AbcdEF1234567890aBcdef12345678',
    })
    expect(params.functionName).toBe('setAddress')
    expect(params.args).toEqual([
      dnsEncodeName('test.eth'),
      60n,
      '0x1234567890abcdef1234567890abcdef12345678',
    ])
  })

  it('clears with empty bytes', () => {
    expect(
      setAddressParameters({ name: 'test.eth', coin: 60, value: null }).args[2],
    ).toBe('0x')
  })
})

describe('setTextParameters', () => {
  it('addresses the record by DNS-encoded name and clears with an empty string', () => {
    expect(
      setTextParameters({ name: 'test.eth', key: 'avatar', value: null }).args,
    ).toEqual([dnsEncodeName('test.eth'), 'avatar', ''])
  })
})

describe('setContenthashParameters', () => {
  it('clears with empty bytes', () => {
    expect(
      setContenthashParameters({ name: 'test.eth', contentHash: null }).args,
    ).toEqual([dnsEncodeName('test.eth'), '0x'])
  })
})

describe('resolverMulticallParameters', () => {
  it('returns no calls when nothing is set', async () => {
    expect(await resolverMulticallParameters({ name: 'test.eth' })).toEqual([])
  })

  it('orders contenthash, texts, coins', async () => {
    const calls = await resolverMulticallParameters({
      name: 'test.eth',
      contentHash: null,
      texts: [{ key: 'a', value: 'b' }],
      coins: [{ coin: 'ETH', value: null }],
    })
    expect(calls.map((c) => c.functionName)).toEqual([
      'setContenthash',
      'setText',
      'setAddress',
    ])
  })
})
