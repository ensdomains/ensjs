import type { Address, Chain, Client, Transport } from 'viem'
import { getChainContractAddress as viem_getChainContractAddress } from 'viem/utils'

type ExtractContracts<chain> = chain extends { contracts: infer C }
  ? { [key in keyof C as string extends key ? never : key]: C[key] }
  : never

export const getChainContractAddress = <
  const chain extends Chain,
  contracts extends ExtractContracts<chain> = ExtractContracts<chain>,
  contractName extends keyof contracts = keyof contracts,
>({
  blockNumber,
  client,
  contract,
}: {
  blockNumber?: bigint
  client: Client<Transport, chain>
  contract: contractName
}) =>
  viem_getChainContractAddress({
    blockNumber,
    chain: client.chain as Chain,
    contract: contract as string,
  }) as contracts[contractName] extends { address: infer A }
    ? A extends Address
      ? A
      : never
    : never
