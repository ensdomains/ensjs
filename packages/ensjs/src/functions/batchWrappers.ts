import { ENSArgs } from '..'
import { hexEncodeName } from '../utils/hexEncodedName'


export const universalWrapper = {
  raw: async (
    { address }: any,
    name: string,
    data: string,
  ) => {
    //TODO: pass through address
    const { contractInterface, defaultAddress } = await import('../contracts/universalResolver')
    return {
      to: defaultAddress,
      data: contractInterface.encodeFunctionData(
        'resolve',
        [hexEncodeName(name), data],
      ),
    }
  },
  decode: async (_: any, data: string) => {
    const { contractInterface } = await import('../contracts/universalResolver')
    const response = await contractInterface.decodeFunctionResult('resolve', data)
    if (!response || !response[0]) {
      return null
    }
    return { data: response[0], resolver: response[1] }
  },
}

export const resolverMulticallWrapper = {
  raw: async (
    { contracts }: ENSArgs<'contracts'>,
    data: { to: string; data: string }[],
  ) => {
    const publicResolver = await contracts?.getPublicResolver()!
    const formattedDataArr = data.map((item) => (item as any).data)
    return {
      to: publicResolver.address,
      data: publicResolver.interface.encodeFunctionData('multicall', [
        formattedDataArr,
      ]),
    }
  },
  decode: async ({ contracts }: ENSArgs<'contracts'>, data: string) => {
    const publicResolver = await contracts?.getPublicResolver()!
    const response = publicResolver.interface.decodeFunctionResult(
      'multicall',
      data,
    )
    if (!response) {
      return null
    }
    return response
  },
}
