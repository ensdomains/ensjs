import { formatsByCoinType, formatsByName } from '@ensdomains/address-encoder'
import { ethers } from 'ethers'
import { ENSArgs, InternalENS } from '.'
import { decodeContenthash, DecodedContentHash } from './utils/contentHash'
import { hexEncodeName } from './utils/hexEncodedName'

type InternalProfileOptions = {
  contentHash?: boolean | string | DecodedContentHash
  texts?: string[]
  coinTypes?: string[]
}

type ProfileResponse = {
  contentHash?: string | DecodedContentHash
  texts?: string[]
  coinTypes?: string[]
}

type DataItem = {
  key: string | number
  type: 'addr' | 'text' | 'contentHash'
  coin?: string
  value: string
}
const makeMulticallData = async (
  { contracts }: Pick<InternalENS, 'contracts'>,
  name: string,
  options: InternalProfileOptions,
) => {
  const publicResolver = await contracts?.getPublicResolver()

  let calls: any[] = []

  const encodeData = (sig: string, ...args: any[]) =>
    publicResolver?.interface.encodeFunctionData(sig, [...args])

  const addCalls = (
    recordArray: string[],
    recordType: string,
    functionArgs: string,
    name: string,
    ...args: any[]
  ) =>
    recordArray.forEach((item: string) =>
      calls.push({
        key: item,
        data: encodeData(
          recordType + functionArgs,
          ethers.utils.namehash(name),
          item,
          ...args,
        ),
        type: recordType,
      }),
    )

  options.texts && addCalls(options.texts, 'text', '(bytes32,string)', name)
  options.coinTypes &&
    addCalls(options.coinTypes, 'addr', '(bytes32,uint256)', name)
  if (typeof options.contentHash === 'boolean' && options.contentHash) {
    calls.push({
      key: 'contentHash',
      data: encodeData('contenthash(bytes32)', ethers.utils.namehash(name)),
      type: 'contenthash',
    })
  }

  if (!calls.find((x) => x.key === '60')) {
    calls.push({
      key: '60',
      data: encodeData(
        'addr(bytes32,uint256)',
        ethers.utils.namehash(name),
        '60',
      ),
      type: 'addr',
    })
  }

  const data = publicResolver?.interface.encodeFunctionData(
    'multicall(bytes[])',
    [calls.map((call: any) => call.data)],
  )

  return { data, calls }
}

const makeHashIndexes = (data: string, name: string) =>
  [...data.matchAll(ethers.utils.namehash(name).substring(2) as any)].map(
    (x: any) => x.index / 2 - 1,
  )

const getDataForName = async (
  { contracts }: Pick<InternalENS, 'contracts'>,
  name: string,
  options: InternalProfileOptions,
) => {
  const universalResolver = await contracts?.getUniversalResolver()

  const { data, calls } = await makeMulticallData({ contracts }, name, options)

  const resolver = await universalResolver?.resolve(hexEncodeName(name), data)
  const [recordData] = ethers.utils.defaultAbiCoder.decode(
    ['bytes[]'],
    resolver['0'],
  )

  console.log(resolver['1'])

  return {
    address: ethers.utils.defaultAbiCoder.decode(
      ['bytes'],
      recordData[calls.findIndex((x) => x.key === '60')],
    )[0],
    records: formatRecords(recordData, calls, options),
    resolverAddress: resolver['1'],
  }
}

const getDataForAddress = async (
  { contracts }: Pick<InternalENS, 'contracts'>,
  address: string,
  options: InternalProfileOptions,
) => {
  const DNCOCURP = await contracts?.getDNCOCURP()

  const reverseNode = address.toLowerCase().substring(2) + '.addr.reverse'

  const { data, calls } = await makeMulticallData(
    { contracts },
    reverseNode,
    options,
  )

  const result = await DNCOCURP?.reverse(hexEncodeName(reverseNode), [
    {
      target: '0x9e6c745CAEdA0AB8a7AD0f393ef90dcb7C70074A',
      data: data,
      dataType: 0,
      locations: makeHashIndexes(data as string, reverseNode),
    },
  ])

  const name = result.name
  const URData = result.returnData[0]
  const [URDecoded, resolverAddress] = ethers.utils.defaultAbiCoder.decode(
    ['bytes', 'address'],
    URData,
  )
  const [recordData] = ethers.utils.defaultAbiCoder.decode(
    ['bytes[]'],
    URDecoded,
  )

  if (
    ethers.utils.defaultAbiCoder.decode(
      ['bytes'],
      recordData[calls.findIndex((x) => x.key === '60')],
    )[0] !== address.toLowerCase()
  ) {
    return { name, records: null, match: false }
  }
  return {
    name,
    records: formatRecords(recordData, calls, options),
    match: true,
    resolverAddress,
  }
}

const formatRecords = (
  data: any[],
  calls: any[],
  options: InternalProfileOptions,
) => {
  let returnedRecords: DataItem[] = data
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
          try {
            itemRet = { ...itemRet, value: decodeContenthash(decodedFromAbi) }
          } catch {
            return null
          }
      }
      return itemRet
    })
    .filter((x): x is DataItem => {
      return typeof x === 'object'
    })
    .filter((x) => x !== null)

  let returnedResponse: {
    contentHash?: string | null | DecodedContentHash
    coinTypes?: DataItem[]
    texts?: DataItem[]
  } = {}

  if (
    typeof options.contentHash === 'string' ||
    typeof options.contentHash === 'object'
  ) {
    if (
      typeof options.contentHash === 'string' &&
      ethers.utils.hexStripZeros(options.contentHash) === '0x'
    ) {
      returnedResponse.contentHash = null
    } else if (
      ethers.utils.hexStripZeros((options.contentHash as any).decoded) === '0x'
    ) {
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

const graphFetch = async (
  { gqlInstance }: Pick<InternalENS, 'gqlInstance'>,
  name: string,
  wantedRecords: ProfileOptions,
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

  const client = gqlInstance.client

  const {
    domains: [{ resolver: resolverResponse }],
  } = await client.request(query, { name })

  let returnedRecords: ProfileResponse = {}

  Object.keys(wantedRecords).forEach((key: string) => {
    const data = wantedRecords[key as keyof ProfileOptions]
    if (typeof data === 'boolean' && data) {
      if (key === 'contentHash') {
        returnedRecords[key] = decodeContenthash(resolverResponse.contentHash)
      } else {
        returnedRecords[key as keyof ProfileOptions] = resolverResponse[key]
      }
    }
  })

  return returnedRecords
}

type ProfileOptions = {
  contentHash?: boolean
  texts?: boolean | string[]
  coinTypes?: boolean | string[]
}

const getProfileFromAddress = async (
  {
    contracts,
    gqlInstance,
    getName,
  }: ENSArgs<'contracts' | 'gqlInstance' | 'getName'>,
  address: string,
  options?: ProfileOptions,
) => {
  if (
    !options ||
    (options && options.texts === true) ||
    options.coinTypes === true
  ) {
    const name = await getName(address)
    if (!name.match) return { name, records: null, match: false }
    const wantedRecords = await graphFetch(
      { gqlInstance },
      name.name,
      options || { contentHash: true, texts: true, coinTypes: true },
    )
    const { records } = await getDataForName(
      { contracts },
      name.name,
      wantedRecords,
    )
    return { name: name.name, records, match: true }
  } else {
    return await getDataForAddress(
      { contracts },
      address,
      options as InternalProfileOptions,
    )
  }
}

const getProfileFromName = async (
  { contracts, gqlInstance }: ENSArgs<'contracts' | 'gqlInstance'>,
  name: string,
  options?: ProfileOptions,
) => {
  if (
    !options ||
    (options && options.texts === true) ||
    options.coinTypes === true
  ) {
    const wantedRecords = await graphFetch(
      { gqlInstance },
      name,
      options || { contentHash: true, texts: true, coinTypes: true },
    )
    return await getDataForName({ contracts }, name, wantedRecords)
  } else {
    return await getDataForName(
      { contracts },
      name,
      options as InternalProfileOptions,
    )
  }
}

export default async function (
  {
    contracts,
    gqlInstance,
    getName,
  }: ENSArgs<'contracts' | 'gqlInstance' | 'getName'>,
  nameOrAddress: string,
  options?: ProfileOptions,
) {
  if (options && options.coinTypes && typeof options.coinTypes !== 'boolean') {
    options.coinTypes = options.coinTypes.map((coin: string) => {
      if (!isNaN(parseInt(coin))) {
        return coin
      } else {
        return `${formatsByName[coin.toUpperCase()].coinType}`
      }
    })
  }

  if (nameOrAddress.includes('.')) {
    return getProfileFromName(
      { contracts, gqlInstance },
      nameOrAddress,
      options,
    )
  } else {
    return getProfileFromAddress(
      { contracts, gqlInstance, getName },
      nameOrAddress,
      options,
    )
  }
}
