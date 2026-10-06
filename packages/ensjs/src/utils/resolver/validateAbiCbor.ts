export const MAX_ABI_CBOR_BYTES = 1024 * 1024
const MAX_DEPTH = 64
const MAX_ITEMS = 100000

/**
 * Validate untrusted CBOR before calling address-encoder's synchronous decoder.
 * Its current release can loop at EOF or inside indefinite strings. A promise
 * timeout cannot interrupt that loop, so bound the input and validate every
 * container and string before handing it to the decoder.
 */
export function validateAbiCbor(data: Uint8Array): void {
  if (data.length > MAX_ABI_CBOR_BYTES) throw new Error('CBOR ABI is too large')
  const textDecoder = new TextDecoder('utf-8', { fatal: true })
  let offset = 0
  let items = 0

  function requireBytes(length: number) {
    if (
      !Number.isSafeInteger(length) ||
      length < 0 ||
      length > data.length - offset
    )
      throw new Error('Truncated CBOR ABI')
  }

  function readByte(): number {
    requireBytes(1)
    return data[offset++]
  }

  function readArgument(additional: number): number {
    if (additional < 24) return additional
    if (additional === 31) return -1
    if (additional > 27) throw new Error('Invalid CBOR argument')
    const width = 2 ** (additional - 24)
    requireBytes(width)
    let value = 0
    for (let i = 0; i < width; i++) value = value * 256 + readByte()
    return value
  }

  function readBreak(): boolean {
    requireBytes(1)
    if (data[offset] !== 0xff) return false
    offset++
    return true
  }

  function readItem(depth: number): void {
    items++
    if (depth > MAX_DEPTH || items > MAX_ITEMS)
      throw new Error('CBOR ABI exceeds decoding limits')
    const initial = readByte()
    const major = initial >> 5
    const argument = readArgument(initial & 0x1f)
    if (argument < 0 && (major < 2 || major > 5))
      throw new Error('Invalid indefinite CBOR item')

    switch (major) {
      case 2:
      case 3:
        // These forms do not terminate in address-encoder 1.1.4, even when the
        // CBOR is valid. Keep rejecting them until the upstream fix is released.
        if (argument < 0) throw new Error('Unsupported indefinite CBOR string')
        requireBytes(argument)
        if (major === 3)
          textDecoder.decode(data.subarray(offset, offset + argument))
        offset += argument
        break
      case 4:
      case 5: {
        const count = argument * (major === 5 ? 2 : 1)
        if (argument >= 0) {
          // Check declared sizes before the decoder can allocate an array.
          requireBytes(count)
          if (count > MAX_ITEMS - items)
            throw new Error('CBOR ABI exceeds decoding limits')
          for (let i = 0; i < count; i++) readItem(depth + 1)
        } else {
          while (!readBreak()) {
            readItem(depth + 1)
            if (major === 5) readItem(depth + 1)
          }
        }
        break
      }
      case 6:
        readItem(depth + 1)
        break
    }
  }

  readItem(0)
  if (offset !== data.length) throw new Error('Remaining CBOR ABI bytes')
}
