import { formatsByCoinType } from '@ensdomains/address-encoder'
import packet from 'dns-packet'
import { ethers } from 'ethers'
import { gql, GraphQLClient } from 'graphql-request'

const universalResolverABI = [
  'error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)',
  'function registry() view returns (address)',
  'function resolve(bytes name, bytes data) view returns (bytes)',
  'function resolveCallback(bytes response, bytes extraData) view returns (bytes)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
]

const publicResolverABI = [
  'function ABI(bytes32 node, uint256 contentTypes) view returns (uint256, bytes)',
  'function addr(bytes32 node) view returns (address)',
  'function addr(bytes32 node, uint256 coinType) view returns (bytes)',
  'function clearDNSZone(bytes32 node)',
  'function contenthash(bytes32 node) view returns (bytes)',
  'function dnsRecord(bytes32 node, bytes32 name, uint16 resource) view returns (bytes)',
  'function hasDNSRecords(bytes32 node, bytes32 name) view returns (bool)',
  'function interfaceImplementer(bytes32 node, bytes4 interfaceID) view returns (address)',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'function multicall(bytes[] data) returns (bytes[] results)',
  'function name(bytes32 node) view returns (string)',
  'function pubkey(bytes32 node) view returns (bytes32 x, bytes32 y)',
  'function setABI(bytes32 node, uint256 contentType, bytes data)',
  'function setAddr(bytes32 node, uint256 coinType, bytes a)',
  'function setAddr(bytes32 node, address a)',
  'function setApprovalForAll(address operator, bool approved)',
  'function setContenthash(bytes32 node, bytes hash)',
  'function setDNSRecords(bytes32 node, bytes data)',
  'function setInterface(bytes32 node, bytes4 interfaceID, address implementer)',
  'function setName(bytes32 node, string newName)',
  'function setPubkey(bytes32 node, bytes32 x, bytes32 y)',
  'function setText(bytes32 node, string key, string value)',
  'function setZonehash(bytes32 node, bytes hash)',
  'function supportsInterface(bytes4 interfaceID) pure returns (bool)',
  'function text(bytes32 node, string key) view returns (string)',
  'function zonehash(bytes32 node) view returns (bytes)',
]

const universalResolverAddress = '0x9e6c745CAEdA0AB8a7AD0f393ef90dcb7C70074A'
const publicResolverAddress = '0xAEfF4f4d8e2cB51854BEa2244B3C5Fb36b41C7fC'

const hexEncodeName = (name: string) =>
  `0x${packet.name.encode(name).toString('hex')}`

const client = new GraphQLClient(
  'http://localhost:8000/subgraphs/name/graphprotocol/ens',
)

const provider = new ethers.providers.StaticJsonRpcProvider(
  'http://localhost:8545',
  'ropsten',
)

const UniversalResolver = new ethers.Contract(
  universalResolverAddress,
  universalResolverABI,
  provider,
)
const PublicResolver = new ethers.Contract(
  publicResolverAddress,
  publicResolverABI,
  provider,
)

// const targetName = 'jefflau.eth'
// const targetAddress = '0x5A384227B65FA093DEC03Ec34e111Db80A040615'
// const targetReverseNode =
//   targetAddress.substring(2).toLowerCase() + '.addr.reverse'

const query = gql`
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

// const getAddr = async () => {
//   const data = (
//     await PublicResolver.populateTransaction['addr(bytes32)'](
//       ethers.utils.namehash(targetName),
//     )
//   ).data
//   const call = await UniversalResolver.resolve(hexEncodeName(targetName), data)
//   console.log(call)
//   const [ret] = ethers.utils.defaultAbiCoder.decode(['address'], call)
//   console.log(ret)
// }

// const getPrimary = async () => {
//   const data = (
//     await PublicResolver.populateTransaction['name(bytes32)'](
//       ethers.utils.namehash(targetReverseNode),
//     )
//   ).data

//   const resolver = await UniversalResolver.resolve(
//     hexEncodeName(targetReverseNode),
//     data,
//   )
//   const [ret] = ethers.utils.defaultAbiCoder.decode(['string'], resolver)
//   const {
//     domains: [{ resolver: retRecords }],
//   } = await client.request(query, { name: ret })
//   console.log(ret, retRecords)
// }

const makeResolverData = async (functionName: string, ...args: any[]) =>
  (await PublicResolver.populateTransaction[functionName](...args)).data
const makeResolverDataWithNamehash = async (
  functionName: string,
  name: string,
  ...args: any[]
) => await makeResolverData(functionName, ethers.utils.namehash(name), ...args)

const addCalls = async (
  keyArray: string[],
  callArray: any[],
  type: string,
  callArgs: string,
  name: string,
  ...args: any[]
) =>
  keyArray.forEach(async (item: string) =>
    callArray.push({
      key: item,
      data: await makeResolverDataWithNamehash(
        type + callArgs,
        name,
        item,
        ...args,
      ),
      type,
    }),
  )

const getProfile = async (name: string) => {
  const {
    domains: [
      {
        resolver: { texts, coinTypes, contentHash },
      },
    ],
  } = await client.request(query, { name })
  let calls: any[] = []
  await addCalls(texts, calls, 'text', '(bytes32,string)', name)
  await addCalls(coinTypes, calls, 'addr', '(bytes32,uint256)', name)
  contentHash &&
    calls.push({
      key: 'contentHash',
      data: await makeResolverDataWithNamehash('contenthash(bytes32)', name),
      type: 'contenthash',
    })

  const data = (
    await PublicResolver.populateTransaction['multicall(bytes[])'](
      calls.map((call: any) => call.data),
    )
  ).data

  const resolver = await UniversalResolver.resolve(hexEncodeName(name), data)
  const [ret] = ethers.utils.defaultAbiCoder.decode(['bytes[]'], resolver)
  const text = ret
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
  console.log(text)
}

getProfile('jefflau.eth')
