import { encodeAbi } from './encodeAbi'

describe('encodeAbi', () => {
  it('encodes data as JSON', async () => {
    const data = { foo: 'bar' }
    const result = await encodeAbi({ encodeAs: 'json', data })
    expect(result.contentType).toEqual(1)
    expect(result.encodedData).toEqual('0x7b22666f6f223a22626172227d')
  })

  it('encodes data as zlib', async () => {
    const data = { foo: 'bar' }
    const result = await encodeAbi({ encodeAs: 'zlib', data })
    expect(result.contentType).toEqual(2)
    expect(result.encodedData).toEqual(
      '0x789cab564acbcf57b2524a4a2c52aa05001d7a0434',
    )
  })

  it('encodes data as cbor', async () => {
    const data = { foo: 'bar' }
    const result = await encodeAbi({ encodeAs: 'cbor', data })
    expect(result.contentType).toEqual(4)
    expect(result.encodedData).toEqual('0xa163666f6f63626172')
  })

  it('encodes data as uri', async () => {
    const data = 'foo=bar'
    const result = await encodeAbi({ encodeAs: 'uri', data })
    expect(result.contentType).toEqual(8)
    expect(result.encodedData).toEqual('0x666f6f3d626172')
  })
})
