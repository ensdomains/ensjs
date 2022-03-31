import { ethers } from 'ethers'
import { ENSArgs } from '.'
import { FuseOptions } from './@types/FuseOptions'
import generateFuseInput from './utils/generateFuseInput'

export default async function (
  { contracts }: ENSArgs<'contracts'>,
  name: string,
  fusesToBurn: FuseOptions,
) {
  const nameWrapper = await contracts?.getNameWrapper()!
  const namehash = ethers.utils.namehash(name)

  const encodedFuses = generateFuseInput(fusesToBurn)

  return nameWrapper.burnFuses(namehash, encodedFuses)
}
