import type { Chain } from 'viem'
import { getChainContractAddress as _getChainContractAddress } from 'viem/utils'

type ExtractContract<TClient> = TClient extends {
  chain: { contracts: infer C }
}
  ? C extends Record<string, { address: string }>
    ? C
    : never
  : never

export const getChainContractAddress = <
  const TClient extends { chain: Chain },
  TContracts extends ExtractContract<TClient> = ExtractContract<TClient>,
  TContract extends keyof TContracts = keyof TContracts,
>({
  blockNumber,
  client,
  contract,
}: {
  blockNumber?: bigint
  client: TClient
  contract: TContract
}) =>
  _getChainContractAddress({
    blockNumber,
    chain: client.chain,
    contract: contract as string,
  }) as TContracts[TContract]['address']
