import { ethers } from 'ethers'

const publicResolverAddress = '0xAEfF4f4d8e2cB51854BEa2244B3C5Fb36b41C7fC'

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

export default (provider: any) =>
  new ethers.Contract(publicResolverAddress, publicResolverABI, provider)
