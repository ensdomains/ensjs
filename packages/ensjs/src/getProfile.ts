import { formatsByCoinType } from '@ensdomains/address-encoder'
import { ethers } from 'ethers'
import { hexEncodeName } from './utils/hexEncodedName'

type InternalProfileOptions = {
  contentHash?: boolean | string
  texts?: string[]
  coinTypes?: string[]
}

type ProfileResponse = {
  contentHash?: string | null
  texts?: string[]
  coinTypes?: string[]
}

const _getProfile = async (
  _provider: ethers.providers.Provider,
  _gql: any,
  contracts: any,
  name: string,
  options: InternalProfileOptions,
) => {
  const publicResolver = await contracts.getPublicResolver()
  const universalResolver = await contracts.getUniversalResolver()

  const makeResolverDataWithNamehash = (
    functionName: string,
    name: string,
    ...args: any[]
  ) =>
    publicResolver.interface.encodeFunctionData(functionName, [
      ethers.utils.namehash(name),
      ...args,
    ])

  const addCalls = (
    keyArray: string[],
    callArray: any[],
    type: string,
    callArgs: string,
    name: string,
    ...args: any[]
  ) =>
    keyArray.forEach((item: string) =>
      callArray.push({
        key: item,
        data: makeResolverDataWithNamehash(
          type + callArgs,
          name,
          item,
          ...args,
        ),
        type,
      }),
    )

  let calls: any[] = []
  options.texts &&
    addCalls(options.texts, calls, 'text', '(bytes32,string)', name)
  options.coinTypes &&
    addCalls(options.coinTypes, calls, 'addr', '(bytes32,uint256)', name)
  if (typeof options.contentHash === 'boolean' && options.contentHash) {
    calls.push({
      key: 'contentHash',
      data: makeResolverDataWithNamehash('contenthash(bytes32)', name),
      type: 'contenthash',
    })
  }

  const data = publicResolver.interface.encodeFunctionData(
    'multicall(bytes[])',
    [calls.map((call: any) => call.data)],
  )

  const resolver = await universalResolver.resolve(hexEncodeName(name), data)
  const [ret] = ethers.utils.defaultAbiCoder.decode(['bytes[]'], resolver)
  let returnedRecords = ret
    .map((item: string, i: number) => {
      let decodedFromAbi: any
      let itemRet: Record<string, any> = {
        key: calls[i].key,
        type: calls[i].type,
      }
      if (itemRet.type === 'addr' || itemRet.type === 'contenthash') {
        decodedFromAbi = ethers.utils.defaultAbiCoder.decode(['bytes'], item)[0]
        if (ethers.utils.hexStripZeros(decodedFromAbi) === '0x') {
          return null
        }
      }
      switch (calls[i].type) {
        case 'text':
          itemRet = {
            ...itemRet,
            value: ethers.utils.defaultAbiCoder.decode(['string'], item)[0],
          }
          if (itemRet.value === '') return null
          break
        case 'addr':
          const format = formatsByCoinType[calls[i].key]
          if (format) {
            itemRet = {
              ...itemRet,
              coin: format.name,
              value: format.encoder(
                Buffer.from(decodedFromAbi.slice(2), 'hex'),
              ),
            }
            break
          } else {
            return null
          }
        case 'contenthash':
          itemRet = { ...itemRet, value: decodedFromAbi }
          break
      }
      return itemRet
    })
    .filter((x: any) => x !== null)

  let returnedResponse: ProfileResponse = {}
  if (typeof options.contentHash === 'string') {
    if (ethers.utils.hexStripZeros(options.contentHash) === '0x') {
      returnedResponse.contentHash = null
    } else {
      returnedResponse.contentHash = options.contentHash
    }
  } else if (options.contentHash) {
    const foundRecord = returnedRecords.find(
      (item: any) => item.type === 'contenthash',
    )
    returnedResponse.contentHash = foundRecord ? foundRecord.value : null
  }
  if (options.texts) {
    returnedResponse.texts = returnedRecords.filter(
      (x: any) => x.type === 'text',
    )
  }
  if (options.coinTypes) {
    returnedResponse.coinTypes = returnedRecords.filter(
      (x: any) => x.type === 'addr',
    )
  }
  return returnedResponse
}

type ProfileOptions = {
  contentHash?: boolean
  texts?: boolean | string[]
  coinTypes?: boolean | string[]
}

export default async (
  provider: ethers.providers.Provider,
  gqlInstance: any,
  contracts: any,
  name: string,
  options?: ProfileOptions,
) => {
  const query = gqlInstance.gql`
    query getRecords($name: String!) {
      domains(where: { name: $name }) {
        resolver {
          texts
          coinTypes
          contentHash
          addr {
            id
          }
        }
      }
    }
  `
  const client = gqlInstance.getClient()

  const wantedRecords: ProfileOptions = options || {
    contentHash: true,
    texts: true,
    coinTypes: true,
  }
  let fetchGraph = false
  Object.keys(wantedRecords).forEach((key: string) => {
    const data = wantedRecords[key as keyof ProfileOptions]
    if (typeof data === 'boolean' && data) {
      fetchGraph = true
    }
  })
  if (fetchGraph) {
    const {
      domains: [{ resolver: resolverResponse }],
    } = await client.request(query, { name })
    Object.keys(wantedRecords).forEach((key: string) => {
      const data = wantedRecords[key as keyof ProfileOptions]
      if (typeof data === 'boolean' && data) {
        wantedRecords[key as keyof ProfileOptions] = resolverResponse[key]
      }
    })
  }
  return _getProfile(
    provider,
    gqlInstance,
    contracts,
    name,
    wantedRecords as InternalProfileOptions,
  )
}
