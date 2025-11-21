import { hexToBigInt, labelhash } from 'viem'

export const labelToCanonicalId = (label: string) => {
  const id = hexToBigInt(labelhash(label))
  const low32 = id & 0xffffffffn
  return id ^ low32
}
