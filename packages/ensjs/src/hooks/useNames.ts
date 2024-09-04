import { QueryClient, useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import { getNamesForAddress } from '../subgraph.js'
import type { ClientWithEns } from '../contracts/consts.js'

export type UseNamesParams = {
  address: Address
  client: ClientWithEns
}

// TODO: figure out why not taking from provider
const qclient = new QueryClient()
export const useNames = (data: UseNamesParams) => {
  const { address, client } = data

  return useQuery(
    {
      queryKey: ['ensjs', 'names-for-address', address],
      queryFn: async () => {
        const result = await getNamesForAddress(client, {
          address,
        })

        return result
      },
    },
    qclient,
  )
}
