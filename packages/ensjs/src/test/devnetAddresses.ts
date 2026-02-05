import { type Address, getAddress } from 'viem'

/**
 * Single source of truth for all devnet contract addresses.
 * Used by globalSetup, addTestContracts, and seedTestNames.
 */

// L1 devnet addresses from namechain
export const L1_DEVNET_ADDRESSES = {
  ENSRegistry: getAddress('0x0165878A594ca255338adfa4d48449f69242Eb8F'),
  UniversalResolver: getAddress(
    '0x4631BCAbD6dF18D94796344963cB60d44a4136b6',
  ),
  Multicall: getAddress('0xcA11bde05977b3631167028862bE2a173976CA11'),
  BaseRegistrarImplementation: getAddress(
    '0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575',
  ),
  DNSRegistrar: getAddress('0x36b58F5C1969B7b6591D752ea6F5486D069010AB'),
  LegacyETHRegistrarController: getAddress(
    '0xBEc49fA140aCaA83533fB00A2BB19bDdd0290f25',
  ),
  ETHRegistrarController: getAddress(
    '0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d',
  ),
  NameWrapper: getAddress('0xFD471836031dc5108809D173A067e8486B9047A3'),
  PublicResolver: getAddress('0x49fd2BE640DB2910c2fAb69bB8531Ab6E76127ff'),
  LegacyPublicResolver: getAddress(
    '0x7A9Ec1d04904907De0ED7b6839CcdD59c3716AC9',
  ),
  ReverseRegistrar: getAddress(
    '0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3',
  ),
  DefaultReverseRegistrar: getAddress(
    '0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf',
  ),
  StaticBulkRenewal: getAddress(
    '0xC9a43158891282A2B1475592D5719c001986Aaec',
  ),
  DNSSECImpl: getAddress('0x7a2088a1bFc9d81c55368AE168C2C02570cB814F'),
  NoMulticallResolver: getAddress(
    '0x7A9Ec1d04904907De0ED7b6839CcdD59c3716AC9',
  ),
  OldestResolver: getAddress('0x7A9Ec1d04904907De0ED7b6839CcdD59c3716AC9'),
  Root: getAddress('0x4826533B4897376654Bb4d4AD88B7faFD0C98528'),
  DedicatedResolver: getAddress(
    '0x9A676e781A523b5d0C0e43731313A708CB607508',
  ),
  UserRegistry: getAddress('0x0B306BF915C4d645ff596e518fAf3F9669b97016'),
  V2EthRegistry: getAddress('0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'),
  VerifiableFactory: getAddress(
    '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  ),
} as const satisfies Record<string, Address>

// L2 devnet addresses
export const L2_DEVNET_ADDRESSES = {
  EthRegistrar: getAddress('0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0'),
  USDC: getAddress('0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'),
} as const satisfies Record<string, Address>
