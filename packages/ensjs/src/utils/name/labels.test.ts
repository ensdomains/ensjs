import { labelhash } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  checkIsDecrypted,
  decodeLabelhash,
  encodeLabelhash,
  isEncodedLabelhash,
  saveLabel,
  saveName,
} from './labels.js'

describe('decodeLabelhash()', () => {
  it('decodes labelhash', () => {
    expect(
      decodeLabelhash(
        '[9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658]',
      ),
    ).toEqual(
      '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658',
    )
  })
  it('throws error when label does not start with [', () => {
    expect(() =>
      decodeLabelhash(
        '9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658]',
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidEncodedLabelError: Invalid encoded label

      - Supplied label: 9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658]

      Details: Expected encoded labelhash to start and end with square brackets

      Version: @ensdomains/ensjs@1.0.0-mock.0]
    `)
  })
  it('throws error when label does not end with ]', () => {
    expect(() =>
      decodeLabelhash(
        '[9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658',
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidEncodedLabelError: Invalid encoded label

      - Supplied label: [9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658

      Details: Expected encoded labelhash to start and end with square brackets

      Version: @ensdomains/ensjs@1.0.0-mock.0]
    `)
  })
  it('throws error when label length is not 66', () => {
    expect(() =>
      decodeLabelhash(
        '[9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb65]',
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidEncodedLabelError: Invalid encoded label

      - Supplied label: [9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb65]

      Details: Expected encoded labelhash to have a length of 66

      Version: @ensdomains/ensjs@1.0.0-mock.0]
    `)
  })
  it('throws error when decoded content is not valid hex', () => {
    // 64 chars between the brackets, correct length, but not hex - this is
    // the shape that let a crafted label reach GraphQL query interpolation
    // unvalidated (getDecodedName.ts) before this fix
    const nonHexPayload = `[${'z", labelname_not: null }) { labelname } evil: __typename #'.padEnd(64, ' ')}]`
    expect(() =>
      decodeLabelhash(nonHexPayload),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidEncodedLabelError: Invalid encoded label

      - Supplied label: [z", labelname_not: null }) { labelname } evil: __typename #     ]

      Details: Expected encoded labelhash to contain a valid hex string

      Version: @ensdomains/ensjs@1.0.0-mock.0]
    `)
  })
})

describe('encodeLabelhash()', () => {
  it('encodes labelhash', () => {
    expect(
      encodeLabelhash(
        '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658',
      ),
    ).toEqual(
      '[9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658]',
    )
  })
  it('throws error when labelhash does not start with 0x', () => {
    expect(() =>
      encodeLabelhash(
        '9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658',
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidLabelhashError: Invalid labelhash

      - Supplied labelhash: 9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658

      Details: Expected labelhash to start with 0x

      Version: @ensdomains/ensjs@1.0.0-mock.0]
    `)
  })
  it('throws error when labelhash length is not 66', () => {
    expect(() =>
      encodeLabelhash(
        '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb65',
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidLabelhashError: Invalid labelhash

      - Supplied labelhash: 0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb65

      Details: Expected labelhash to have a length of 66

      Version: @ensdomains/ensjs@1.0.0-mock.0]
    `)
  })
})

describe('isEncodedLabelhash()', () => {
  it('returns true when labelhash is encoded', () => {
    expect(
      isEncodedLabelhash(
        '[9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658]',
      ),
    ).toBe(true)
  })
  it('returns false when labelhash is not encoded', () => {
    expect(isEncodedLabelhash('sdfsdfsd')).toBe(false)
  })
})

describe('saveLabel()', () => {
  it('saves label to localStorage', () => {
    vi.spyOn(global.localStorage, 'setItem')
    saveLabel('test')
    expect(global.localStorage.setItem).toHaveBeenCalledWith(
      'ensjs:labels',
      JSON.stringify({ [labelhash('test')]: 'test' }),
    )
  })
})

describe('saveName()', () => {
  beforeEach(() => {
    global.localStorage.clear()
  })
  it('saves each label from name to localStorage', () => {
    vi.spyOn(global.localStorage, 'setItem')
    saveName('test.eth')
    expect(global.localStorage.setItem).toHaveBeenCalledWith(
      'ensjs:labels',
      JSON.stringify({ [labelhash('test')]: 'test' }),
    )
    expect(global.localStorage.setItem).toHaveBeenCalledWith(
      'ensjs:labels',
      JSON.stringify({
        [labelhash('test')]: 'test',
        [labelhash('eth')]: 'eth',
      }),
    )
  })
  it('does not save encoded label to localStorage', () => {
    vi.spyOn(global.localStorage, 'setItem')
    saveName(
      '[9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658].eth',
    )
    expect(global.localStorage.setItem).toHaveBeenCalledWith(
      'ensjs:labels',
      JSON.stringify({ [labelhash('eth')]: 'eth' }),
    )
  })
})

describe('checkIsDecrypted()', () => {
  it('returns true for a plain string', () => {
    expect(checkIsDecrypted('test.eth')).toBe(true)
  })
  it('returns false for a string containing an encoded label', () => {
    expect(
      checkIsDecrypted(
        '[9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658].eth',
      ),
    ).toBe(false)
  })
  it('returns true for an array of plain labels', () => {
    expect(checkIsDecrypted(['test', 'eth'])).toBe(true)
  })
  it('returns false for an array containing an encoded label', () => {
    // Array.prototype.includes does exact-element equality, not substring
    // matching, so this previously fell through to `true` regardless of
    // content
    expect(
      checkIsDecrypted([
        '[9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658]',
        'eth',
      ]),
    ).toBe(false)
  })
})
