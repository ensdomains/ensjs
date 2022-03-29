import { ethers } from 'ethers'

export const makeOtherIndexes = (data: string, findStr: string) =>
  [...data.matchAll(findStr as any)].map((x: any) => x.index / 2 - 1)

export const makeNamehashIndexes = (data: string, name: string) =>
  [...data.matchAll(ethers.utils.namehash(name).substring(2) as any)].map(
    (x: any) => x.index / 2 - 1,
  )
