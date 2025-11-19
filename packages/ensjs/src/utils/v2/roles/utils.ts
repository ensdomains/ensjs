import { numberToHex } from 'viem'

export function uint4x64FromUint256(u: bigint | number): number[] {
  return Array.from(numberToHex(u, { size: 32 }).slice(2), (x) =>
    Number.parseInt(x),
  )
}
