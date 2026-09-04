import type { Address } from 'viem'
import { namehash } from 'viem'
import { describe, expect, it } from 'vitest'
import { dnsEncodeName } from '../../../../utils/v2/resolver/recordParameters.js'
import { linkToNodeWriteParameters } from './linkToNode.js'
import {
  linkToRecordWriteParameters,
  UNLINKED_RECORD_ID,
} from './linkToRecord.js'

const resolverAddress = '0x1111111111111111111111111111111111111111' as Address
const client = {
  account: { address: '0x2222222222222222222222222222222222222222' },
  chain: { id: 1 },
} as unknown as Parameters<typeof linkToNodeWriteParameters>[0]

describe('linkToNodeWriteParameters', () => {
  it('encodes linkToNode(sourceName, namehash(targetName))', () => {
    const params = linkToNodeWriteParameters(client, {
      sourceName: 'alias.eth',
      targetName: 'target.eth',
      resolverAddress,
    })
    expect(params.address).toBe(resolverAddress)
    expect(params.functionName).toBe('linkToNode')
    expect(params.args).toEqual([
      dnsEncodeName('alias.eth'),
      namehash('target.eth'),
    ])
  })
})

describe('linkToRecordWriteParameters', () => {
  it('unlinks by default', () => {
    const params = linkToRecordWriteParameters(client, {
      sourceName: 'alias.eth',
      resolverAddress,
    })
    expect(params.functionName).toBe('linkToRecord')
    expect(params.args).toEqual([
      dnsEncodeName('alias.eth'),
      UNLINKED_RECORD_ID,
    ])
  })

  it('links to an explicit record id', () => {
    const params = linkToRecordWriteParameters(client, {
      sourceName: 'alias.eth',
      recordId: 3n,
      resolverAddress,
    })
    expect(params.args).toEqual([dnsEncodeName('alias.eth'), 3n])
  })
})
