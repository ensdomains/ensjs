import { ethers } from 'ethers'
import { UniversalResolver__factory } from '../generated/factories/UniversalResolver__factory'

export const defaultAddress = '0x9e6c745CAEdA0AB8a7AD0f393ef90dcb7C70074A'

const ABI = [
  'error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)',
  'function findResolver(bytes name) view returns (address, bytes32)',
  'function registry() view returns (address)',
  'function resolve(bytes name, bytes data) view returns (bytes, address)',
  'function resolveCallback(bytes response, bytes extraData) view returns (bytes)',
  'function reverse(bytes reverseNode) view returns (string, bytes)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
]


export const contractInterface = UniversalResolver__factory.createInterface()

export default (provider: ethers.providers.JsonRpcProvider, address?: string) =>
  UniversalResolver__factory.connect(address || defaultAddress, provider)
