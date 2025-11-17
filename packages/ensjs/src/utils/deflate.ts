import { bytesToHex, type Hex, hexToBytes } from 'viem'

export async function deflateToHex(data: unknown): Promise<Hex> {
  const json = JSON.stringify(data)
  const input = new TextEncoder().encode(json)

  // Stream through CompressionStream("deflate")
  const cs = new CompressionStream('deflate')
  const writer = cs.writable.getWriter()
  writer.write(input)
  writer.close()

  const compressed = new Uint8Array(
    await new Response(cs.readable).arrayBuffer(),
  )

  return bytesToHex(compressed)
}

/**
 * Inflate a deflate-compressed hex string back to its original JSON value.
 */
export async function inflateFromHex<T = unknown>(encoded: Hex): Promise<T> {
  const compressed = hexToBytes(encoded)

  const ds = new DecompressionStream('deflate')
  const source = new ReadableStream({
    start(c) {
      c.enqueue(compressed)
      c.close()
    },
  })
  const inflatedStream = source.pipeThrough(ds)

  const text = await new Response(inflatedStream).text()

  return JSON.parse(text) as T
}
